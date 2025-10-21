"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSubmit: (data: T) => Promise<void> | void;
}

interface FormErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user starts typing
      if (errors[name as string]) {
        setErrors((prev) => ({ ...prev, [name as string]: "" }));
      }
    },
    [errors]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValue(name as keyof T, value);
    },
    [setValue]
  );

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      try {
        // Validate the entire form but only return errors for the specific field
        schema.parse({ ...values, [name]: value });
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues.find(
            (issue) => issue.path[0] === name
          );
          return fieldError?.message || null;
        }
        return "Invalid value";
      }
    },
    [schema, values]
  );

  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }
      return false;
    }
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmit(values);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  const clearFieldError = useCallback((name: keyof T) => {
    setErrors((prev) => ({ ...prev, [name as string]: "" }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    setValue,
    handleChange,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    setFieldError,
    clearFieldError,
    setSubmitError,
  };
}
