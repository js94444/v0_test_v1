"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface UploadedFile {
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
}

interface FileUploadProps {
  label: string
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  required?: boolean
  error?: string
  description?: string
  onFilesUploaded?: (files: UploadedFile[]) => void
  className?: string
}

export function FileUpload({
  label,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  required,
  error,
  description,
  onFilesUploaded,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      
      // Upload files to Azure Blob
      setUploading(true)
      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }
          
          return response.json()
        })
        
        const results = await Promise.all(uploadPromises)
        const newUploadedFiles = [...uploadedFiles, ...results]
        setUploadedFiles(newUploadedFiles)
        onFilesUploaded?.(newUploadedFiles)
        
        toast({
          title: "파일 업로드 완료",
          description: `${acceptedFiles.length}개 파일이 업로드되었습니다.`,
        })
      } catch (error) {
        console.error('[v0] File upload error:', error)
        toast({
          title: "업로드 실패",
          description: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [files, uploadedFiles, maxFiles, onFilesUploaded, toast],
  )

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-6 cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          error && "border-destructive",
          (files.length >= maxFiles || uploading) && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} disabled={uploading} />
        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? "파일을 여기에 놓으세요" : "파일을 드래그하거나 클릭하여 업로드"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                최대 {maxFiles}개, {Math.round(maxSize / 1024 / 1024)}MB 이하
              </p>
            </>
          )}
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)}KB)</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
