import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAIFix() {
  const [fixing, setFixing] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const getAIFix = useCallback(async (code: string, error: string) => {
    setFixing(true);
    setFixedCode(null);
    setExplanation(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fix-code', {
        body: { code, error },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setFixedCode(data.fixedCode);
      setExplanation(data.explanation || null);
      return data.fixedCode as string;
    } catch (err) {
      console.error('AI fix error:', err);
      return null;
    } finally {
      setFixing(false);
    }
  }, []);

  const clearFix = useCallback(() => {
    setFixedCode(null);
    setExplanation(null);
  }, []);

  return { fixing, fixedCode, explanation, getAIFix, clearFix };
}
