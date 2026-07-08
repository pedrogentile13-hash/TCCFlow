// Root app
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [tw, setTw] = useStateA({ ...window.TWEAKS });

  useEffectA(() => {
    applyDom(window.TWEAKS);
    const onTweak = () => setTw({ ...window.TWEAKS });
    window.addEventListener("tweaks-changed", onTweak);
    return () => window.removeEventListener("tweaks-changed", onTweak);
  }, []);

  let HeroComp = HeroEditorial;
  if (tw.heroVariant === "product") HeroComp = HeroProduct;
  if (tw.heroVariant === "manifesto") HeroComp = HeroManifesto;

  return (
    <>
      <CursorBlob/>
      <Nav/>
      <HeroComp/>
      <Ticker/>
      <HowItWorks/>
      <Features/>
      <Demo/>
      <Personas/>
      <Pricing/>
      <FAQ/>
      <CTAFinal/>
      <Footer/>
      <TweaksPanel/>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
