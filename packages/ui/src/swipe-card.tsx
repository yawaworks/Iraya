"use client"

import { type ReactNode, type Ref, useImperativeHandle } from "react"
import { motion, useAnimation, useMotionValue, useTransform, type PanInfo } from "framer-motion"

export type SwipeDirection = "left" | "right" | "up" | "down"

export interface SwipeCardHandle {
  swipe: (direction?: SwipeDirection) => Promise<void>
  restoreCard: () => Promise<void>
}

export interface SwipeCardProps {
  children: ReactNode
  onSwipe?: (direction: SwipeDirection) => void
  onCardLeftScreen?: (direction: SwipeDirection) => void
  preventSwipe?: SwipeDirection[]
  className?: string
  ref?: Ref<SwipeCardHandle>
}

const EXIT_DISTANCE = 600
const VELOCITY_THRESHOLD = 500
const OFFSET_THRESHOLD = 120

/**
 * Horizontal drag-to-decide card: drag past a distance/velocity threshold
 * to fire a swipe, or call the imperative `swipe()` handle from a button.
 * Built directly on framer-motion — no third-party swipe-card dependency.
 */
export function SwipeCard({
  children,
  onSwipe,
  onCardLeftScreen,
  preventSwipe = [],
  className,
  ref,
}: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-15, 15])
  const controls = useAnimation()

  async function fireSwipe(direction: SwipeDirection) {
    if (preventSwipe.includes(direction)) return
    onSwipe?.(direction)

    const exitX = direction === "left" ? -EXIT_DISTANCE : direction === "right" ? EXIT_DISTANCE : 0

    await controls.start({
      x: exitX,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    })

    onCardLeftScreen?.(direction)
  }

  async function restoreCard() {
    x.set(0)
    await controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } })
  }

  useImperativeHandle(ref, () => ({
    swipe: (direction: SwipeDirection = "right") => fireSwipe(direction),
    restoreCard,
  }))

  function handleDragEnd(_: unknown, info: PanInfo) {
    const passesThreshold =
      Math.abs(info.offset.x) > OFFSET_THRESHOLD || Math.abs(info.velocity.x) > VELOCITY_THRESHOLD

    if (passesThreshold) {
      fireSwipe(info.offset.x > 0 ? "right" : "left")
      return
    }

    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } })
  }

  return (
    <motion.div
      className={className}
      drag="x"
      dragElastic={0.7}
      style={{ x, rotate, touchAction: "pan-y" }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {children}
    </motion.div>
  )
}