import { MotionConfig } from 'framer-motion';
import { Book } from './components/book/Book';
import { Drinks } from './components/Drinks';
import { CandleGlow } from './components/effects/CandleGlow';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { TapasMenu } from './components/menu/TapasMenu';
import { MobileDock } from './components/MobileDock';
import { Nav } from './components/Nav';
import { PlanTray } from './components/PlanTray';
import { PressStrip } from './components/PressStrip';
import { Story } from './components/Story';
import { Visit } from './components/Visit';
import { spring } from './lib/motion';
import { NowProvider } from './lib/now';
import { PlanProvider } from './lib/plan';

export function App() {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <NowProvider>
        <PlanProvider>
          <div className="app">
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <CandleGlow />
            <Nav />
            <main id="main" tabIndex={-1}>
              <Hero />
              <PressStrip />
              <Story />
              <TapasMenu />
              <Drinks />
              <Gallery />
              <Book />
              <Visit />
            </main>
            <Footer />
            <PlanTray />
            <MobileDock />
            <div className="film" aria-hidden="true" />
          </div>
        </PlanProvider>
      </NowProvider>
    </MotionConfig>
  );
}
