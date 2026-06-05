import { useState, useRef } from 'react'
import { Camera, Upload, Scan, Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { classifySubject, getSubjectLabelCN, type Subject } from '../services/subjectClassifier'

export interface SmartUploadResult {
  questionImages: string[]
  questionText: string
  subject: Subject
  subjectConfidence: number
}

interface SmartUploadProps {
  onComplete: (result: SmartUploadResult) => void
  onCancel: () => void
}

export default function SmartUpload({ onComplete, onCancel }: SmartUploadProps) {
  const [images, setImages] = useState<string[]>([])
  const [ocrText, setOcrText] = useState('')
  const [step, setStep] = useState<'upload' | 'processing' | 'classifying' | 'result'>('upload')
  const [progress, setProgress] = useState('')
  const [classification, setClassification] = useState<{
    subject: Subject
    confidence: number
    scores: Record<string, number>
  } | null>(null)
  const [manualSubject, setManualSubject] = useState<Subject | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setStep('processing')
    setProgress('读取图片...')

    const readers = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => resolve(ev.target?.result as string)
      reader.readAsDataURL(file)
    }))

    Promise.all(readers).then(async (dataUrls) => {
      setImages(dataUrls)
      setProgress(`已加载 ${dataUrls.length} 张图片，开始 OCR 识别...`)

      // OCR
      setStep('classifying')
      try {
        const worker = await createWorker('chi_sim+eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(`📖 文字识别中... ${Math.round(m.progress * 100)}%`)
            }
          },
        })

        let combined = ''
        for (let i = 0; i < dataUrls.length; i++) {
          setProgress(`📖 识别第 ${i + 1}/${dataUrls.length} 张...`)
          const { data } = await worker.recognize(dataUrls[i])
          combined += data.text + '\n'
        }
        await worker.terminate()

        const text = combined.trim()
        setOcrText(text)
        setProgress('🔍 正在智能分析科目...')

        // Classify
        const result = classifySubject(text)
        setClassification(result)
        setStep('result')
        setProgress('')
      } catch (err) {
        setProgress('OCR 识别失败，请手动输入')
        console.error(err)
      }
    })

    e.target.value = ''
  }

  const getConfidenceColor = (c: number) => {
    if (c >= 0.8) return 'text-success'
    if (c >= 0.5) return 'text-secondary'
    return 'text-danger'
  }

  const handleConfirm = () => {
    const finalSubject = manualSubject || classification?.subject || 'specialty'
    onComplete({
      questionImages: images,
      questionText: ocrText,
      subject: finalSubject as Subject,
      subjectConfidence: classification?.confidence || 0,
    })
  }

  const handleRetry = () => {
    setImages([])
    setOcrText('')
    setClassification(null)
    setManualSubject(null)
    setStep('upload')
    setProgress('')
  }

  if (step === 'processing' || step === 'classifying') {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-sm text-text font-medium mb-2">
          {step === 'processing' ? '正在处理图片...' : '智能分析中...'}
        </p>
        <p className="text-xs text-text-secondary">{progress}</p>
        {images.length > 0 && step === 'processing' && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((img, i) => (
              <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg border border-border" alt="" />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/30 transition-colors">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-text mb-2">智能上传错题</h3>
          <p className="text-xs text-text-secondary mb-6 max-w-sm mx-auto leading-relaxed">
            上传你的错题照片，系统会自动识别文字并判断所属科目
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              选择图片
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Camera className="w-4 h-4" />
              拍照
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
        </div>
      )}

      {/* Result */}
      {step === 'result' && classification && (
        <div className="space-y-4">
          {/* Classification Result */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <Scan className="w-4 h-4 text-primary" />
                智能识别结果
              </h3>
              <button onClick={handleRetry} className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors">
                <RotateCcw className="w-3 h-3" /> 重新上传
              </button>
            </div>

            {/* Image thumbs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <img key={i} src={img} className="w-20 h-20 object-cover rounded-lg border border-border shrink-0" alt="" />
              ))}
            </div>

            {/* Subject prediction */}
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">系统判断科目</span>
                <span className="text-xs font-medium text-text flex items-center gap-1">
                  {classification.confidence >= 0.5 ? (
                    <><Check className="w-3 h-3 text-success" /> 置信度 {Math.round(classification.confidence * 100)}%</>
                  ) : (
                    <><AlertCircle className="w-3 h-3 text-secondary" /> 置信度较低</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-2xl">
                  {classification.subject === 'math' ? '📐' : classification.subject === 'politics' ? '📖' : classification.subject === 'english' ? '📝' : '📚'}
                </span>
                <span className={`text-lg font-bold ${getConfidenceColor(classification.confidence)}`}>
                  {getSubjectLabelCN(classification.subject)}
                </span>
              </div>

              {/* Confidence bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    classification.confidence >= 0.8 ? 'bg-success' : classification.confidence >= 0.5 ? 'bg-secondary' : 'bg-danger'
                  }`}
                  style={{ width: `${Math.round(classification.confidence * 100)}%` }}
                />
              </div>
            </div>

            {/* Manual override */}
            <div>
              <p className="text-xs text-text-secondary mb-2">如果分类不对，可以手动选择：</p>
              <div className="grid grid-cols-4 gap-2">
                {(['math', 'politics', 'english', 'specialty'] as Subject[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setManualSubject(s)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                      (manualSubject || classification.subject) === s
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-text-secondary hover:border-primary/30'
                    }`}
                  >
                    {s === 'math' ? '📐' : s === 'politics' ? '📖' : s === 'english' ? '📝' : '📚'}
                    <br />
                    {getSubjectLabelCN(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* OCR text */}
            {ocrText && (
              <details className="mt-4">
                <summary className="text-xs text-text-secondary cursor-pointer hover:text-primary">
                  查看识别的文字内容
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-text leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {ocrText}
                </div>
              </details>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-border rounded-xl text-text-secondary hover:bg-gray-50 transition-colors text-sm">
              取消
            </button>
            <button onClick={handleConfirm} className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium">
              确认并继续填写
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
