import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/database";

const OCCASIONS = [
  { value: 'day' },
  { value: 'evening' },
  { value: 'special' },
  { value: 'any' },
] as const;

const NOTE_FAMILIES = [
  { value: 'woody' },
  { value: 'citrus' },
  { value: 'floral' },
  { value: 'oriental' },
  { value: 'gourmand' },
  { value: 'aquatic' },
  { value: 'green' },
  { value: 'musk' },
] as const;

type Occasion = typeof OCCASIONS[number]['value'];
type NoteFamily = typeof NOTE_FAMILIES[number]['value'];

function recommendProducts(
  products: Product[],
  occasion: Occasion | null,
  notes: NoteFamily[],
  fav: string,
): Product[] {
  const noteScores = (p: Product): number => {
    const fam = (p.family || '').toLowerCase();
    return notes.reduce((acc, n) => acc + (fam.includes(n) ? 1 : 0), 0);
  };

  const favScore = (p: Product): number => {
    if (!fav) return 0;
    const f = fav.toLowerCase();
    return (p.name.toLowerCase().includes(f) || p.brand.toLowerCase().includes(f)) ? 0.5 : 0;
  };

  const scored = products.map(p => ({
    product: p,
    score: noteScores(p) + favScore(p) + (occasion === 'any' ? 0.1 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.product).filter(p => p);
}

function chipClasses(active: boolean): string {
  return (
    "rounded-pill px-4 py-2 text-body border duration-instant ease-default " +
    (active
      ? "bg-mocha text-paper border-mocha"
      : "bg-surface text-text border-border hover:bg-surface-2")
  );
}

export function RecommendationWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation("discovery");
  const href = useLocalizedHref();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [] } = usePricedProducts();

  const step = searchParams.get('step') || '1';
  const occasion = (searchParams.get('occasion') as Occasion) || null;
  const notes = (searchParams.get('notes')?.split(',').filter(Boolean) || []) as NoteFamily[];
  const fav = searchParams.get('fav') || '';

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next, { replace: true });
  };

  const setOccasion = (o: Occasion) => updateParams({ occasion: o });
  const toggleNote = (n: NoteFamily) => {
    const has = notes.includes(n);
    if (has) {
      updateParams({ notes: notes.filter(x => x !== n).join(',') || null });
    } else if (notes.length < 3) {
      updateParams({ notes: [...notes, n].join(',') });
    }
  };
  const setFav = (v: string) => updateParams({ fav: v });
  const goToStep = (s: string) => updateParams({ step: s });
  const restart = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const results = useMemo(
    () => recommendProducts(products, occasion, notes, fav),
    [products, occasion, notes, fav]
  );

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (occasion) {
      parts.push(t(`recommend.steps.occasion.options.${occasion}`));
    }
    if (notes.length > 0) {
      parts.push(notes.map(n => t(`recommend.steps.notes.options.${n}`)).filter(Boolean).join(', '));
    }
    return parts.filter(Boolean).join(' · ');
  }, [occasion, notes, t]);

  if (step === 'results') {
    return (
      <section className="max-w-[1280px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
          {t('recommend.results.label')}
        </p>
        <h2 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
          {t('recommend.results.title', { count: results.length })}
        </h2>
        {summary && (
          <p className="text-body text-text-muted mb-8">
            {t('recommend.results.basedOn', { summary })}
          </p>
        )}

        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 font-medium text-text-strong mb-4">
              {t('recommend.results.noMatch')}
            </p>
            <Button variant="ghost" onClick={restart}>
              {t('recommend.results.changeAnswers')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(href(`/discovery-sets/builder?prefill=${results.map(r => r.id).join(',')}`))}
              >
                {t('recommend.results.buildSet')}
              </Button>
              <Button variant="ghost" size="lg" onClick={restart}>
                {t('recommend.results.backToQuestions')}
              </Button>
            </div>
          </>
        )}
      </section>
    );
  }

  if (step === '1') {
    return (
      <section className="max-w-[720px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
          {t('recommend.step', { current: 1, total: 3 })}
        </p>
        <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-12">
          {t('recommend.steps.occasion.prompt')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOccasion(o.value)}
              className={chipClasses(occasion === o.value)}
            >
              {t(`recommend.steps.occasion.options.${o.value}`)}
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-end">
          <Button variant="primary" size="lg" disabled={!occasion} onClick={() => goToStep('2')}>
            {t('recommend.continue')}
          </Button>
        </div>
      </section>
    );
  }

  if (step === '2') {
    return (
      <section className="max-w-[720px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
          {t('recommend.step', { current: 2, total: 3 })}
        </p>
        <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-2">
          {t('recommend.steps.notes.prompt')}
        </h2>
        <p className="text-body text-text-muted mb-12">{t('recommend.steps.notes.hint')}</p>
        <div className="flex flex-wrap gap-3">
          {NOTE_FAMILIES.map(n => (
            <button
              key={n.value}
              type="button"
              onClick={() => toggleNote(n.value)}
              className={chipClasses(notes.includes(n.value))}
            >
              {t(`recommend.steps.notes.options.${n.value}`)}
            </button>
          ))}
        </div>
        {notes.length === 3 && (
          <p className="text-caption text-text-muted mt-4">{t('recommend.steps.notes.maxHint')}</p>
        )}
        <div className="mt-12 flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button variant="ghost" size="lg" onClick={() => goToStep('1')}>
            {t('recommend.back')}
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={notes.length === 0}
            onClick={() => goToStep('3')}
          >
            {t('recommend.continue')}
          </Button>
        </div>
      </section>
    );
  }

  // Step 3
  return (
    <section className="max-w-[720px] mx-auto py-16 md:py-24">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        {t('recommend.step', { current: 3, total: 3 })}
      </p>
      <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-2">
        {t('recommend.steps.favorite.prompt')}
      </h2>
      <p className="text-body text-text-muted mb-12">{t('recommend.steps.favorite.hint')}</p>
      <Input
        value={fav}
        onChange={(e) => setFav(e.target.value)}
        placeholder={t('recommend.steps.favorite.placeholder')}
        className="max-w-md"
        maxLength={100}
      />
      <div className="mt-12 flex flex-col sm:flex-row sm:justify-between gap-3">
        <Button variant="ghost" size="lg" onClick={() => goToStep('2')}>
          {t('recommend.back')}
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" size="lg" onClick={() => goToStep('results')}>
            {t('recommend.skip')}
          </Button>
          <Button variant="primary" size="lg" onClick={() => goToStep('results')}>
            {t('recommend.submit')}
          </Button>
        </div>
      </div>
    </section>
  );
}
