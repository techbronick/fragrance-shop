import { useTranslation, Trans } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldCheck, Truck } from "lucide-react";
import { whatsappLink } from "@/utils/whatsapp";

// Vertical-stack tabs ("collapsibles") for the static merchant policy
// shown under the PDP description. Same accordion primitive used on the
// FAQ page so the visual rhythm and keyboard behavior match.
export function ProductPolicyAccordion() {
  const { t } = useTranslation("product");
  return (
    <section className="max-w-[720px] mx-auto">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="warranty">
          <AccordionTrigger className="text-caption uppercase tracking-[0.06em] text-text-strong hover:no-underline">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {t("policy.warranty.title")}
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-body text-text-muted leading-relaxed">
            {t("policy.warranty.body")}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-caption uppercase tracking-[0.06em] text-text-strong hover:no-underline">
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4" aria-hidden="true" />
              {t("policy.shipping.title")}
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-body text-text-muted leading-relaxed space-y-2">
            <p>{t("policy.shipping.inCity")}</p>
            <p>{t("policy.shipping.outsideCity")}</p>
            <p>{t("policy.shipping.timeline")}</p>
            <p>
              <Trans
                i18nKey="policy.shipping.whatsapp"
                ns="product"
                components={{
                  wa: (
                    <a
                      href={whatsappLink(t("policy.shipping.waMessage"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mocha hover:text-mocha-hover underline underline-offset-2"
                    />
                  ),
                }}
              />
            </p>
            <p className="text-caption text-text-muted">
              {t("policy.shipping.retailNote")}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
