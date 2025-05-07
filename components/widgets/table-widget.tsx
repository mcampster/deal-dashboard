"use client"

import type React from "react"
import { useState } from "react"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"

interface TableWidgetProps {
  children: React.ReactNode
  entityType?: string
  onPreviewClick?: (entityId: string) => void
  getEntityDetailRoute?: (entityId: string) => string
}

const TableWidget: React.FC<TableWidgetProps> = ({ children, entityType, onPreviewClick, getEntityDetailRoute }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)

  // Handle preview click if not provided externally
  const handlePreviewClick = (entityId: string) => {
    if (onPreviewClick) {
      onPreviewClick(entityId)
    } else if (entityType) {
      setPreviewEntityId(entityId)
      setPreviewOpen(true)
    }
  }

  // Handle closing the preview panel
  const handlePreviewClose = () => {
    setPreviewOpen(false)
    if (!previewOpen) {
      setTimeout(() => {
        setPreviewEntityId(null)
      }, 300)
    }
  }

  return (
    <>
      <div className="rounded-md border overflow-auto compact-table">{children}</div>

      {entityType && previewEntityId && (
        <EntityPreviewPanel
          open={previewOpen}
          onClose={handlePreviewClose}
          entityId={previewEntityId}
          entityType={entityType}
        />
      )}
    </>
  )
}

export default TableWidget
