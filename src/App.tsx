import { MotionConfig } from 'framer-motion';
import { Book } from './components/book/Book';
import { Drinks } from './components/Drinks';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { TapasMenu } from './components/menu/TapasMenu';
import { MobileDock } from './components/MobileDock';
import { Nav } from './components/Nav';
import { Press } from './components/Press';
import { Story } from './components/Story';
import { Visit } from './components/Visit';
import { Welcome } from './components/Welcome';
import { spring } from './lib/motion';
import { NowProvider } from './lib/now';

export function App() {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <NowProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1}>
          <Hero />
          <Press />
          <Welcome />
          <TapasMenu />
          <Drinks />
          <Story />
          <Gallery />
          <Book />
          <Visit />
        </main>
        <Footer />
        <MobileDock />
      </NowProvider>
    </MotionConfig>
  );
}
