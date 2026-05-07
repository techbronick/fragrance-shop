import { Helmet } from "react-helmet-async";

export function JsonLd({ payload }: { payload: object }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Helmet>
  );
}
