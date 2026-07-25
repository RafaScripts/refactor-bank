'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PdfExportButtonProps {
  htmlContent?: string
  targetId?: string
  filename?: string
  buttonText?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function PdfExportButton({ 
  htmlContent, 
  targetId, 
  filename = 'documento.pdf', 
  buttonText = 'Baixar PDF',
  variant = 'outline',
  size = 'sm',
  className
}: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    try {
      setIsGenerating(true)
      
      // Dynamic import because html2pdf only works in the browser
      const html2pdf = (await import('html2pdf.js')).default

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      let source: string | HTMLElement | null = null

      if (htmlContent) {
        source = htmlContent
      } else if (targetId) {
        source = document.getElementById(targetId)
        if (!source) {
          throw new Error(`Elemento com ID ${targetId} não encontrado.`)
        }
      } else {
        throw new Error('É necessário informar htmlContent ou targetId.')
      }

      await html2pdf().set(opt).from(source).save()
      
      toast.success('PDF gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error)
      toast.error(error.message || 'Erro ao gerar o PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={generatePDF} 
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? 'Gerando...' : buttonText}
    </Button>
  )
}
