"use client"

import { useEffect, useCallback } from "react"

type KeyHandler = (event: KeyboardEvent) => void
type Options = {
  enableOnFormTags?: boolean
  preventDefault?: boolean
}

export function useHotkeys(
  keys: string,
  callback: KeyHandler,
  options: Options = { enableOnFormTags: false, preventDefault: true },
) {
  const { enableOnFormTags = false, preventDefault = true } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if the event is happening in a form element and enableOnFormTags is false
      if (
        !enableOnFormTags &&
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement ||
          (event.target instanceof HTMLElement && event.target.isContentEditable))
      ) {
        return
      }

      // Parse the key combination
      const keyCombination = keys.toLowerCase().split("+")

      // Check if all modifiers are pressed
      const altRequired = keyCombination.includes("alt")
      const ctrlRequired = keyCombination.includes("ctrl")
      const shiftRequired = keyCombination.includes("shift")
      const metaRequired = keyCombination.includes("meta")

      // Check if modifiers match
      if (
        altRequired !== event.altKey ||
        ctrlRequired !== event.ctrlKey ||
        shiftRequired !== event.shiftKey ||
        metaRequired !== event.metaKey
      ) {
        return
      }

      // Get the main key (the last one in the combination)
      const mainKey = keyCombination[keyCombination.length - 1]

      // Special keys mapping
      const specialKeys: Record<string, string> = {
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        esc: "escape",
        space: " ",
      }

      // Get the actual key to check
      const keyToCheck = specialKeys[mainKey] || mainKey

      // Check if the key matches
      if (event.key.toLowerCase() === keyToCheck) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(event)
      }
    },
    [callback, keys, enableOnFormTags, preventDefault],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}
