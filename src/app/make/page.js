import Link from "next/link";

export const metadata = {
  title: "make • soft.computer",
  description:
    "a guide to making your own soft computer — materials, electronics, knitting, corpus, and code.",
};

export default function MakePage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h1" style={{ marginBottom: 6 }}>
          make
        </div>
        <p className="p subtle" style={{ marginTop: 0 }}>
          a guide to building your own soft computer. this is not a strict
          blueprint — it is a starting point. use my build as a reference and
          make something that is yours. if you make one, i want to see it!
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          before you start
        </div>
        <p className="p">
          a soft computer is a computing object designed around softness rather
          than hardness. it does not have to look like mine. it does not have to
          use the same materials, the same microcontroller, or the same corpus.
          what matters is the intent: build something that is slow, tactile, and
          yours.
        </p>
        <p className="p">
          mine took about eight months. yours might take a weekend or a year.
          the only rule is that it should feel different to interact with than a
          phone or a laptop.
        </p>
        <div className="aboutCallouts" style={{ marginTop: 16 }}>
          <div className="aboutCallout">
            <div className="aboutLabel">what makes it soft</div>
            <ul className="aboutList">
              <li>
                the enclosure is made from textile or soft materials, not
                plastic or metal
              </li>
              <li>
                the inputs are touch-based and ambiguous — not buttons that do
                exactly one thing
              </li>
              <li>
                the output is slow and poetic, not instant and informational
              </li>
              <li>it is designed to be sat with, not operated</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          01 — materials
        </div>
        <p className="p">
          the enclosure of my soft computer is built in layers. each layer
          serves a structural and aesthetic purpose. you can substitute any of
          these with whatever you have access to.
        </p>
        <div className="aboutTwoCol">
          <div className="aboutCard">
            <div className="aboutLabel">what i used</div>
            <ul className="aboutList">
              <li>
                <strong>upholstery foam</strong> — carved to hold the
                electronics, filled with batting for structure
              </li>
              <li>
                <strong>neoprene</strong> — exterior shell, holds everything
                together
              </li>
              <li>
                <strong>industrial felt</strong> — for the soft buttons
              </li>
              <li>
                <strong>open-weave linen</strong> — removable slip cover in
                macintosh beige
              </li>
              <li>
                <strong>conductive fabric</strong> — for the trackpad sensing
                zones
              </li>
              <li>
                <strong>copper tape</strong> — for wiring the capacitive inputs
              </li>
              <li>
                <strong>velostat</strong> — pressure-sensitive layer under the
                trackpad
              </li>
              <li>
                <strong>craft foam</strong> — used in the mini as the base layer
                for the felt button sandwiches
              </li>
            </ul>
          </div>
          <div className="aboutCard">
            <div className="aboutLabel">substitutions</div>
            <ul className="aboutList">
              <li>
                any dense foam works for structure — yoga mat foam, packing foam
              </li>
              <li>
                neoprene can be replaced with any sturdy fabric — canvas, denim,
                heavy linen
              </li>
              <li>
                felt buttons can be any soft material — wool, fleece, leather
              </li>
              <li>
                conductive fabric can be replaced with bare copper tape alone
                for simple inputs
              </li>
              <li>
                the slip cover is optional but makes it feel more like an object
                and less like a prototype
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          02 — electronics
        </div>
        <p className="p">
          the electronics in my soft computer are deliberately minimal.
          everything runs locally — no internet, no cloud, no subscription. the
          goal was a self-contained object.
        </p>
        <div className="aboutTwoCol">
          <div className="aboutCard">
            <div className="aboutLabel">what i used</div>
            <ul className="aboutList">
              <li>
                <strong>raspberry pi 5</strong> — main processor, runs the
                markov chain and drives the e-ink display
              </li>
              <li>
                <strong>waveshare 10.3&quot; flexible e-ink display</strong> —
                IT8951 HAT, driven over SPI
              </li>
              <li>
                <strong>adafruit fruit jam</strong> — handles all capacitive
                sensing over USB serial to the Pi
              </li>
              <li>
                <strong>haptic motor</strong> — vibrates on each interaction,
                each button has its own pulse pattern
              </li>
              <li>
                <strong>neopixel</strong> — ambient light feedback
              </li>
              <li>
                <strong>thermal printer</strong> — prints poem receipts
              </li>
            </ul>
          </div>
          <div className="aboutCard">
            <div className="aboutLabel">simpler starting point</div>
            <ul className="aboutList">
              <li>
                you don&#39;t need a pi — a raspberry pi zero 2W works fine for
                the markov chain
              </li>
              <li>
                any e-ink display works — even a small 2.9&quot; waveshare is
                enough to show a few lines
              </li>
              <li>
                the fruit jam can be replaced with any circuitpython board with
                capacitive touch — adafruit feather, qtpy, etc.
              </li>
              <li>
                skip the thermal printer and haptics for a simpler first build
              </li>
              <li>one button driving one corpus is a valid soft computer</li>
            </ul>
          </div>
        </div>
        <div className="aboutCallouts" style={{ marginTop: 16 }}>
          <div className="aboutCallout">
            <div className="aboutLabel">wiring overview</div>
            <ul className="aboutList">
              <li>
                felt buttons → copper tape pads → conductive fabric → fruit jam
                capacitive pins → USB to Pi
              </li>
              <li>
                pi → IT8951 HAT → e-ink display over SPI (CS, CLK, MOSI, BUSY,
                RST)
              </li>
              <li>
                haptic motor → fruit jam digital output pin → triggered on
                button press
              </li>
              <li>thermal printer → pi UART or USB</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          03 — the knit panel
        </div>
        <p className="p">
          the knit panel that frames the e-ink display is optional but important
          to me. it is what makes the object feel like it belongs to a textile
          lineage, not a tech lineage.
        </p>
        <p className="p">
          i knit mine on a Brother KH-930 — a domestic knitting machine from
          1986 that you can find secondhand for under $100. i used a lavender
          wool-cotton blend at roughly 70 stitches by 56 rows to get a panel
          that fits a 10.3&quot; display.
        </p>
        <div className="aboutCallouts">
          <div className="aboutCallout">
            <div className="aboutLabel">knit panel specs (my build)</div>
            <ul className="aboutList">
              <li>machine: Brother KH-930, standard gauge (4.5mm)</li>
              <li>yarn: wool-cotton blend, fingering weight, lavender</li>
              <li>dimensions: 70 stitches × 56 rows ≈ 10&quot; × 8&quot;</li>
              <li>tension: approximately 7 (adjust for your yarn)</li>
              <li>
                the panel is mounted around the e-ink so the display sits inside
                it like a soft window
              </li>
            </ul>
          </div>
        </div>
        <p className="p" style={{ marginTop: 12 }}>
          you don&#39;t need a knitting machine. hand-knit, woven, or
          embroidered fabric all work. the point is that the frame around the
          display is made by hand.
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          04 — the corpus
        </div>
        <p className="p">
          the corpus is the text the machine learns from. it is the most
          personal part of the build. mine has four corpora, one per button.
          yours can have one, or ten, or whatever feels right.
        </p>
        <p className="p">
          a corpus is just a text file. a few pages is enough for an order-2
          markov chain to produce interesting output. more text means more
          variety. shorter text means more repetition and a stronger voice.
        </p>
        <div className="aboutCallouts">
          <div className="aboutCallout">
            <div className="aboutLabel">how to build a corpus</div>
            <ul className="aboutList">
              <li>
                pick a theme that matters to you — letters, technical
                documentation, poetry, recipes, anything
              </li>
              <li>collect 1–5 pages of text from that theme</li>
              <li>
                clean it: lowercase, remove punctuation, keep the sentences
                natural
              </li>
              <li>save as a plain .txt file</li>
              <li>feed it to the markov chain — the code handles the rest</li>
            </ul>
          </div>
        </div>
        <p className="p" style={{ marginTop: 12 }}>
          the stranger the corpus, the stranger the output. the more coherent
          the corpus, the more the output sounds like something.
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          05 — the code
        </div>
        <p className="p">
          the soft computer runs a simple order-2 markov chain. it looks at the
          previous two words and picks the next one from a list of words it has
          seen in that position in the corpus. the math is small enough to run
          on a pi zero with memory to spare.
        </p>
        <div className="aboutCallouts">
          <div className="aboutCallout">
            <div className="aboutLabel">what the code does</div>
            <ul className="aboutList">
              <li>reads button presses from the fruit jam over USB serial</li>
              <li>
                selects the active corpus based on which button was pressed
              </li>
              <li>runs the markov chain to generate a sequence of words</li>
              <li>
                renders the text word by word to the e-ink display via the
                IT8951 driver
              </li>
              <li>triggers the haptic motor on each button press</li>
              <li>prints to the thermal printer on a long press</li>
            </ul>
          </div>
        </div>
        <p className="p" style={{ marginTop: 12 }}>
          all code, circuit diagrams, and corpus files will be available in the
          github repo. documentation is ongoing — check back as it grows.
        </p>
        <div
          style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <a
            href="https://github.com/yafira"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            github → yafira
          </a>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="h2" style={{ marginBottom: 16 }}>
          06 — share yours
        </div>
        <p className="p">
          if you make a soft computer — or any soft computing object inspired by
          this project — i want to see it. there is no single right way to do
          it. the only requirement is that it is soft in some sense of the word.
        </p>
        <div className="aboutCallouts">
          <div className="aboutCallout">
            <div className="aboutLabel">how to share</div>
            <ul className="aboutList">
              <li>
                tag{" "}
                <a
                  href="https://www.instagram.com/electrocutelab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  <strong>@electrocutelab</strong>
                </a>{" "}
                on instagram or use <strong>#thesoftcomputer</strong>
              </li>
              <li>
                email{" "}
                <a
                  href="mailto:electrocutelab@protonmail.com"
                  style={{
                    color: "inherit",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  electrocutelab@protonmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="p" style={{ marginTop: 12 }}>
          this project is open source and will stay that way. build something
          gentle. ♡
        </p>
      </section>
    </main>
  );
}
