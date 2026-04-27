'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps } from 'react-hook-form';
import { type z, type ZodType } from 'zod';

/**
 * Thin wrapper around react-hook-form's useForm with:
 * - zodResolver pre-configured
 * - mode: 'onTouched' — validates on first blur, then re-validates on every change
 *
 * Usage:
 *   const form = useAppForm(schema, { defaultValues: { name: '' } });
 */
export function useAppForm<TSchema extends ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>,
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    ...options,
  });
}
