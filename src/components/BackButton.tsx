'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
}

export default function BackButton({ 
  href = '/playground', 
  label = 'Back to Interactive Playgrounds',
  variant = 'outline',
  className = ''
}: BackButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-6 ${className}`}
    >
      <Button variant={variant} asChild className="group">
        <Link href={href} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <Grid3x3 className="h-4 w-4" />
          {label}
        </Link>
      </Button>
    </motion.div>
  );
}