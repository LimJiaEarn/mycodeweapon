"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Card,
  CardSkeletonContainer,
  CardTitle,
  CardDescription,
} from "@/components/root/bentoboxitems/BentoCard";

export default function AiCard({ className }: { className: string }) {
  return (
    <Card className={className}>
      <CardTitle>LLM Integrations</CardTitle>
      <CardDescription className="max-w-full">
        We support over 10+ latest and cutting-edge LLM models
      </CardDescription>
      <CardSkeletonContainer>
        <Skeleton />
      </CardSkeletonContainer>
    </Card>
  );
}

const Skeleton = () => {
  const iconSize = 28;

  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
        <Container className="h-8 w-8 circle-1">
          <Image
            src="/companyIcons/deepseek.svg"
            className="rounded-full"
            alt="deepseek"
            height={iconSize}
            width={iconSize}
          />
        </Container>
        <Container className="h-12 w-12 circle-2">
          <Image
            src="/companyIcons/claude.svg"
            className="rounded-full"
            alt="claude"
            height={iconSize}
            width={iconSize}
          />
        </Container>
        <Container className="circle-3">
          <Image
            src="/companyIcons/openai.svg"
            className="rounded-full"
            alt="openai"
            height={iconSize + 4}
            width={iconSize + 4}
          />
        </Container>
        <Container className="h-8 w-8 circle-5">
          <Image
            src="/companyIcons/gemini.svg"
            className="rounded-full"
            alt="gemini"
            height={iconSize}
            width={iconSize}
          />
        </Container>
        <Container className="h-12 w-12 circle-4">
          <Image
            src="/companyIcons/perplexity.svg"
            className="rounded-full"
            alt="perplexity"
            height={iconSize}
            width={iconSize}
          />
        </Container>
      </div>

      <div className="h-40 w-px absolute top-20 m-auto z-40">
        <Sparkles />
      </div>
    </div>
  );
};

const Sparkles = () => {
  const randomMove = () => Math.random() * 2 - 1;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();
  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `2px`,
            height: `2px`,
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block bg-black dark:bg-white"
        ></motion.span>
      ))}
    </div>
  );
};

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        `h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
    `,
        className
      )}
    >
      {children}
    </div>
  );
};
