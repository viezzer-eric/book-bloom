"use client";
import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface TimelineContentProps extends HTMLMotionProps<any> {
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement>;
  customVariants?: any;
  as?: React.ElementType;
}

export const TimelineContent = ({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  as: Component = "div",
  ...props
}: TimelineContentProps) => {
  const MotionComponent = React.useMemo(() => motion(Component), [Component]);

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
      variants={customVariants}
      custom={animationNum}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
