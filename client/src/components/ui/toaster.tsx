import { useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

function ToastWithSwipe({ id, title, description, action, onClose, ...props }: any) {
  const toastRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ y: number; time: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()
    const deltaY = touchStartRef.current.y - touchEndY
    const deltaTime = touchEndTime - touchStartRef.current.time

    // Swipe up: deltaY > 50 (moved up 50+ pixels) and within 300ms
    if (deltaY > 50 && deltaTime < 300) {
      onClose()
    }

    touchStartRef.current = null
  }

  return (
    <Toast
      key={id}
      ref={toastRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      {action}
      <ToastClose />
    </Toast>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastWithSwipe
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            onClose={() => dismiss(id)}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
