import Link from "next/link";

export const metadata = {
  title: "about • soft.computer",
  description:
    "the soft computer is a textile-based computing object that imagines gentler, more intimate ways of interacting with technology.",
};

export default function AboutPage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h1" style={{ marginBottom: 6 }}>
          about
        </div>
        <p className="p subtle" style={{ marginTop: 0 }}>
          a textile-based computing object that imagines a gentler way of being
          with technology. this project started as a thesis at{" "}
          <a
            href="https://itp.nyu.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            nyu itp (interactive telecommunications program)
          </a>
          , a master&#39;s program at new york university, and is continuing to
          grow beyond it.
        </p>

        <div
          style={{
            marginTop: 16,
            marginBottom: 16,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <img
            src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726135301-tsc_01-E0uhncqo8VXGT9jhxjQQ8qmnEiyO7u.png"
            alt="the soft computer — full object"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 12,
            }}
          />
        </div>

        <div className="aboutGrid">
          <div className="aboutMain">
            <nav className="aboutToc">
              <div className="aboutTocLabel">chapters</div>
              <div className="aboutTocChapters">
                {[
                  {
                    title: "narrative",
                    links: [
                      ["#imagine", "the family computer"],
                      ["#care", "what i mean by care"],
                      ["#question", "central question"],
                    ],
                  },
                  {
                    title: "the form",
                    links: [
                      ["#form", "materials + construction"],
                      ["#knit", "the knit panel"],
                      ["#system", "electronics architecture"],
                      ["#buttons", "four buttons"],
                    ],
                  },
                  {
                    title: "soft os",
                    links: [
                      ["#poetry", "electronic text"],
                      ["#os-states", "os states"],
                    ],
                  },
                  {
                    title: "the work",
                    links: [
                      ["#motivation", "motivation"],
                      ["#sensory", "sensory system"],
                      ["#testing", "user testing"],
                      ["#coming-back", "y2k revisited"],
                    ],
                  },
                  {
                    title: "what&#39;s next",
                    links: [["#whats-next", "v2 + open source"]],
                  },
                ].map((chapter) => (
                  <div key={chapter.title} className="aboutTocChapter">
                    <div className="aboutTocChapterTitle">{chapter.title}</div>
                    <ul className="aboutTocLinks">
                      {chapter.links.map(([href, label]) => (
                        <li key={href}>
                          <a href={href} className="aboutTocLink">
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>

            <h2 className="h2" id="imagine">
              the family computer
            </h2>
            <p className="p">
              you walk over to the family computer. you sit down. the chair is
              too big for you. you turn on the PC and you wait. the monitor hums
              to life slowly, line by line.
            </p>
            <p className="p">
              you want to use the internet. but your mom is on the phone. so you
              wait. and you wait some more. when she finally hangs up, you plug
              in the modem. you hear the dial-up sound. the page loads one image
              at a time. one paragraph at a time. and then the cursor freezes.
              the little hourglass spins. you click anyway. nothing. and then,
              sometimes, the blue screen of death.
            </p>
            <p className="p">
              you sit there. you wait. you restart. you wait more. you try
              again.
            </p>
            <p className="p">
              here&#39;s the thing. the computer takes its time, and so do you.
              it&#39;s slow, almost ceremonial. it doesn&#39;t follow you
              anywhere. it doesn&#39;t ask anything of you. when it works, it
              just waits with you, until something arrives. when it breaks, it
              tells you. you fix it, or you walk away.
            </p>
            <p className="p subtle" style={{ fontStyle: "italic" }}>
              somewhere along the way, we lost the patience the machine used to
              have. i wanted to see if i could find it again.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1771301366397-tsc-rr4XFyJOhbidqM05Q4fEedVrButqTN.png"
                alt="early sketch of the soft computer"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1775956745032-tsc_fullcolor-ECp5gyo6xhqx4KveXSkKK3sCkLI6O6.png"
                alt="the soft computer color sketch"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="what-it-is">
              the soft computer
            </h2>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726140195-tsc-TQTXdUNgseorGS4xebibRNWTy8W4JZ.png"
                alt="the soft computer"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
            <p className="p">
              the soft computer is a compact all-in-one, textile-based computing
              object that uses touch, craft, and embedded electronics to imagine
              gentler, more intimate ways of interacting with technology. rather
              than functioning as a productivity machine, it operates as a
              standalone computational artifact: an enclosure constructed from
              soft materials with machine-knit accents, housing a flexible e-ink
              display, capacitive sensing zones, and a haptic motor.
            </p>
            <p className="p">
              the soft computer is designed to be sat with, not operated. it
              emphasizes presence over output, care over command, and material
              memory over digital abstraction. four felt buttons act as a poetic
              keyboard, each biasing a generative text engine toward a different
              corpus. a trackpad zone controls the mood of language generation.
              a flexible e-ink screen slowly builds poems from touch.
            </p>

            <h2 className="h2" id="care">
              what i mean by care
            </h2>
            <p className="p">
              the soft computer started as an experiment in care, and i should
              be specific about what i mean by that, because it&#39;s a word
              that gets used a lot.
            </p>
            <p className="p">
              care, for me, means a machine that doesn&#39;t extract from you.
              that doesn&#39;t optimize you. that doesn&#39;t treat your
              attention as a resource to mine. care means the computer assumes
              you have a body, a tempo, a tolerance for ambiguity. it means the
              computer is willing to wait for you, instead of demanding you
              hurry up for it. care means the relationship between you and the
              machine is gentle, not transactional.
            </p>
            <p className="p">
              mark weiser, in 1991, called for something close to this. he
              called it calm technology. but i wanted to go further than calm. i
              wanted warm. i wanted tactile. i wanted a computer designed around
              care, not command.
            </p>
            <p className="p">
              in the age of AI, we need a moment of softness. to slow down. to
              ask what we actually want from our machines.
            </p>

            <h2 className="h2" id="question">
              central question
            </h2>
            <p className="p">
              what can a soft computer do that a hard computer never could?
            </p>
            <p className="p">
              what becomes possible when we design computers around softness
              rather than hardness, around care rather than command?
            </p>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <div className="aboutLabel">this project asks</div>
                <ul className="aboutList">
                  <li>
                    what kinds of relationships with technology emerge when
                    interaction is touch, not click
                  </li>
                  <li>
                    how textile interaction can function as computational logic,
                    including inputs, states, and memory
                  </li>
                  <li>
                    how a generative text engine can produce poetry that feels
                    discovered rather than produced
                  </li>
                  <li>
                    how printed output can create material memory and intimacy
                  </li>
                  <li>
                    what it means to design for slowness, legibility, and
                    anti-optimization
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="h2" id="motivation">
              motivation
            </h2>
            <p className="p">
              my relationship to electronics and computation has always been
              shadowed by dissonance with the language of hardness that defines
              the field. hard drives, hard logic, hard science. yet underneath
              every rigid circuit is something fundamentally soft: flexible
              wires, malleable solder, human hands, and patient care.
            </p>
            <p className="p">
              this contradiction deepened as i learned computing history. long
              before silicon, computation lived in textiles. the jacquard loom
              used punched cards to control woven patterns, and ada lovelace
              described computation through weaving. in 1757, mathematician
              alexis clairaut employed two human &ldquo;computers&rdquo; to
              refine halley&#39;s comet predictions. before the machine,
              computation was a body.
            </p>
            <p className="p">
              as computing industrialized, its soft origins were systematically
              erased. women who wired eniac, who wove rope core memory for
              apollo, and who performed invisible computational labor were
              framed as assistants rather than inventors. meanwhile computing
              hardened. speed became virtue. precision became power.
            </p>
            <p className="p">
              this soft computer argues that softness is not weakness. softness
              is the ability to flex, mend, feel, and adapt.
            </p>

            <h2 className="h2">what it means to build a soft computer</h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778728477536-prototype-mpINh9IUNDKKiLYKY0nLL1NadVEvhe.png"
                alt="early prototype of the soft computer"
                style={{
                  width: "75%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <ul className="aboutList">
                  <li>
                    <strong>making an artifact</strong>: a physical, interactive
                    device that embodies computing in textile form
                  </li>
                  <li>
                    <strong>performing research</strong>: fabrication and
                    material exploration used to critique and expand what
                    computing means
                  </li>
                  <li>
                    <strong>writing a counter-history</strong>: reclaiming the
                    woven, embodied origins of computation and its hidden labor
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="h2" id="form">
              the form
            </h2>
            <p className="p">
              the soft computer is built in layers. months of trying different
              combinations until it felt right. soft enough to hold. firm enough
              to hold itself.
            </p>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <ul className="aboutList">
                  <li>
                    machine-knit lavender wool-cotton yarn on a Brother KH-930
                    knitting machine
                  </li>
                  <li>industrial felt for the soft buttons</li>
                  <li>
                    upholstery foam carved out in the middle for the
                    electronics, filled with batting for structure
                  </li>
                  <li>neoprene on the outside, holding everything together</li>
                  <li>
                    a fabric slip cover in macintosh beige open-weave linen
                  </li>
                </ul>
              </div>
            </div>
            <p className="p">
              the chassis is modular. the buttons snap on and off. the
              electronics can be easily disconnected. the whole thing is
              designed to be repairable, opened, and modified — a counter to
              consumer electronics that ship sealed.
            </p>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726507343-material-form-faECb0ZprC7B5TJOG7CaAt0Z3k6sSj.png"
                alt="layered materials and construction"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="system">
              electronics architecture
            </h2>
            <div className="aboutTwoCol">
              <div className="aboutCard">
                <div className="aboutLabel">inputs</div>
                <ul className="aboutList">
                  <li>
                    4 felt buttons — poetic keyboard, each biasing a generative
                    text engine toward a different corpus
                  </li>
                  <li>
                    soft matrix keypad — 4×4 capacitive zones built from copper
                    tape under fabric, modulating the mood of generation
                  </li>
                  <li>
                    trackpad zone — controls the mood and temperature of
                    language generation through gesture
                  </li>
                </ul>
              </div>
              <div className="aboutCard">
                <div className="aboutLabel">outputs</div>
                <ul className="aboutList">
                  <li>
                    flexible 10.3&Prime; e-ink display — slow poetic text builds
                    word by word
                  </li>
                  <li>
                    haptic motor — pulses with each interaction, each button has
                    its own signature
                  </li>
                  <li>
                    thermal printer — ritual receipts as poem artifacts you can
                    take with you
                  </li>
                </ul>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726513845-electronics-IwoyPc9AZXhdoUfNmTaPYmRwWjAr9G.png"
                alt="e-ink display showing generated poetry"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726494806-architecture-iwjHUkl4voP2TH5HuaFO2lLXfEcBU0.jpg"
                alt="system architecture diagram"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="knit">
              the knit panel
            </h2>
            <p className="p">
              the knit panel that frames the e-ink display is the part of the
              object you see first. it is a wool-cotton blend in lavender, knit
              flat on a Brother KH-930 from 1986. 70 stitches, 56 rows, roughly
              10&Prime; &times; 8&Prime;.
            </p>
            <p className="p">
              wool gives it warmth and a slight halo. cotton keeps it stable
              enough to sit cleanly behind the e-ink without sagging. the panel
              is mounted so the e-ink reads as if it&#39;s sitting inside a soft
              window.
            </p>
            <p className="p">
              a second knit pouch in the same lavender yarn holds the Raspberry
              Pi 5 inside. tucking the Pi inside a soft sleeve felt right. the
              part of the computer doing the most thinking is also the part you
              can&#39;t see, wrapped in the same material as the face.
            </p>
            <p className="p">
              using the KH-930 mattered. the machine is from 1986. it&#39;s the
              same kind of domestic technology that has historically been coded
              as women&#39;s work and dismissed as not-really-engineering, even
              though it&#39;s a programmable patterning system that predates
              much of what we now call computing. it sat a few feet from the
              Raspberry Pi on my desk and quietly makes the same point the
              project is making.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726539899-kh930-Rbdeilq27EIgB5kuIC2j3A3DV2Hh5p.png"
                alt="Brother KH-930 knitting machine"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726500287-knit-panel-jGVItGxk0OoTYiICeQLRuohoU59W78.png"
                alt="machine-knit lavender panel"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="buttons">
              four buttons, four answers
            </h2>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778729722544-buttons-HAzFh1BmyhHwlBVVa1iXh7Ga8QhfYS.png"
                alt="four felt buttons close-up"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
            <p className="p">
              each button represents a different relationship to computation.
              each one answers the central question differently. together they
              tell the complete story of the soft computer.
            </p>
            <div className="aboutCallouts">
              <div
                className="aboutCallout"
                style={{ borderLeft: "3px solid #e8b4b8" }}
              >
                <div className="aboutLabel" style={{ color: "#c47c82" }}>
                  blush — lineage
                </div>
                <p className="p small">
                  corpus: women in computing. ada lovelace, the eniac
                  programmers, apollo rope core memory weavers, grace hopper,
                  the women of bell labs. the computer speaks its own history —
                  the history it was never taught to remember.
                </p>
              </div>
              <div
                className="aboutCallout"
                style={{ borderLeft: "3px solid #87b5d4" }}
              >
                <div className="aboutLabel" style={{ color: "#4a85aa" }}>
                  sky blue — dreamlike
                </div>
                <p className="p small">
                  corpus: literary and poetic texts. the computer as poet, not
                  tool. dreamy, abstract, slow generation. language that
                  doesn&#39;t explain itself.
                </p>
              </div>
              <div
                className="aboutCallout"
                style={{ borderLeft: "3px solid #a8d4c2" }}
              >
                <div className="aboutLabel" style={{ color: "#4a9478" }}>
                  mint — textile
                </div>
                <p className="p small">
                  corpus: weaving patterns, jacquard loom history, knit
                  structures, textile computation lineage. the computer
                  remembers it came from the loom.
                </p>
              </div>
              <div
                className="aboutCallout"
                style={{ borderLeft: "3px solid #f5e06e" }}
              >
                <div className="aboutLabel" style={{ color: "#a88c1a" }}>
                  yellow — subverted
                </div>
                <p className="p small">
                  corpus: real CS texts, error messages, technical
                  documentation, logic gates, binary, data structures — run
                  through the generative engine until they become strange and
                  tender. the hard computer&#39;s language made soft and
                  unfamiliar.
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726199199-tsc2-JpXbD1w6wXttvanejBzERO6tIPpd2U.jpg"
                alt="four felt buttons"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="poetry">
              electronic text
            </h2>
            <p className="p">
              most people hear &ldquo;the computer generates text&rdquo; and
              picture something like a massive model trained on the whole
              internet, predicting the most likely thing anyone could say. the
              soft computer is the opposite of that.
            </p>
            <p className="p">
              four buttons, four corpora. each one is a few pages of text chosen
              on purpose. press blush, the machine speaks in the vocabulary of
              ada lovelace, the eniac programmers, the apollo rope memory
              weavers. press yellow, it only has CS documentation and error
              messages to work with. it can&#39;t reach outside the corpus to
              find something more likely. it has to stay in the small specific
              world i built for it.
            </p>
            <p className="p">
              an order-2 markov chain, looking at the previous two words to pick
              the next one. the math is so small you could do it on paper with a
              tally chart. n=1 is gibberish. n=3 is the seam where statistics
              start to feel like writing. n=5 just regurgitates the source.
            </p>
            <p className="p">
              the soft computer doesn&#39;t predict the most likely word. it
              picks the next word from a list of words it has actually seen, in
              a small specific world i made for it. that&#39;s the whole model.
              everything happens locally. no internet, no cloud, no large
              language model. nothing you say or do leaves this object.
            </p>
            <p className="p">
              you might ask why the output is a poem and not a useful tool. the
              answer is care. a tool tells you what to do. a poem invites you to
              interpret. a poem doesn&#39;t optimize anything. it asks you to
              slow down and pay attention.
            </p>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726485969-corpus-G2mf5NPSj7vTcPYTVoA72ifkodYQ3u.jpg"
                alt="diagram of four buttons mapped to four corpora"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778728486953-receipt-EhIRvFvSakB27arFLntNJMyIwhCzeY.png"
                alt="thermal printer receipt — a poem artifact"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="os-states">
              soft os states
            </h2>
            <div className="aboutThreeCol">
              <div className="aboutCard">
                <div className="aboutLabel">wake</div>
                <p className="p small">
                  a short ritual. the display greets you. the haptic pulse
                  begins. the object orients itself toward presence.
                </p>
              </div>
              <div className="aboutCard">
                <div className="aboutLabel">play</div>
                <p className="p small">
                  active interaction. buttons and trackpad generate poetry word
                  by word.
                </p>
              </div>
              <div className="aboutCard">
                <div className="aboutLabel">dream</div>
                <p className="p small">
                  idle ambient mode. the display drifts with self-generated
                  text. breathing slows. the object waits for someone to return.
                </p>
              </div>
            </div>
            <p className="p">
              there is no productivity state. there is no notifications state.
              there is no urgency anywhere in the system.
            </p>

            <h2 className="h2" id="sensory">
              sensory system
            </h2>
            <p className="p">
              the soft computer engages four senses simultaneously — unusual for
              a computing object — plus one often overlooked:
            </p>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <ul className="aboutList">
                  <li>
                    <strong>touch</strong> — felt buttons, soft textile surface
                    with knit wool accents, haptic motor
                  </li>
                  <li>
                    <strong>sight</strong> — slow poetic text on flexible e-ink
                  </li>
                  <li>
                    <strong>proprioception</strong> — the sense of your own body
                    in space. the object has weight. you hold it, cradle it. a
                    screen has no body. this does.
                  </li>
                </ul>
              </div>
            </div>
            <p className="p">
              and one design principle that runs through all of them:{" "}
              <strong>slowness</strong>. the piece is rate-limited and
              intentional. it resists speed. in a world of optimized interfaces,
              the soft computer asks you to wait, to stay, to notice.
            </p>

            <h2 className="h2" id="testing">
              user testing
            </h2>
            <p className="p">
              testing happened in two phases. with the prototype, conversations
              with peers and advisors shaped the early decisions: the inputs
              should be ambiguous, the output slow, the piece something you live
              with rather than operate.
            </p>
            <p className="p">
              with the actual build, what i didn&#39;t expect was how much it
              tested people&#39;s patience. the e-ink updates slowly.
              there&#39;s no progress bar. some people leaned in. others got
              visibly restless within seconds, reaching for their phone or
              asking if it was broken. that restlessness was the most
              interesting finding. the people who stayed described it as
              calming, even meditative. but getting there required unlearning
              something.
            </p>
            <p className="p">
              the things people asked for — sound, scent, warmth — are the
              things i can&#39;t wait to build next.
            </p>
            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src="https://ie6wpryluu0khsu3.public.blob.vercel-storage.com/concept/1778726140195-tsc-TQTXdUNgseorGS4xebibRNWTy8W4JZ.png"
                alt="person interacting with the soft computer"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>

            <h2 className="h2" id="coming-back">
              y2k revisited
            </h2>
            <p className="p">
              i want to come back to the dial-up. the blue screen of death. the
              family computer. we had one growing up. but really, it was mine. i
              was the technical one, the kid who fixed everything for everyone
              else. computers were the first thing i loved figuring out.
            </p>
            <p className="p">
              i&#39;ve watched technology go from some of the slowest times to
              what it is now. during my time, we used to wait until 9pm to talk
              to people for unlimited minutes. twenty years later, we pay for
              unlimited minutes and don&#39;t call anyone. and what&#39;s
              strange is that even the current generation, people who never
              heard a modem, who never waited for a pixelated photo to load line
              by line, sometimes feel a kind of nostalgia for it. for LimeWire
              downloads that took an hour and might be a virus. for blowing into
              a Nintendo cartridge to make it work. for staying up to write the
              perfect away message.
            </p>
            <p className="p subtle" style={{ fontStyle: "italic" }}>
              we used to log on. now we don&#39;t ever log off.
            </p>
            <p className="p">
              the soft computer is built around constraints on purpose. it has a
              small corpus, not the whole internet. one poem at a time, not
              endless content. a receipt you can hold, not a feed you scroll.
              and a finite memory, like the computers we grew up with — the ones
              that made you choose what to keep, and what to let go. the
              constraint isn&#39;t a workaround. the constraint is the point.
            </p>

            <h2 className="h2" id="whats-next">
              what&#39;s next
            </h2>
            <p className="p">
              beyond the spring show and berlin, i want to keep building soft
              peripherals — things that are soft and fully functional. soft
              keyboards, soft pointing devices, soft screens, soft cases. and i
              want to keep iterating on the soft computer itself. a v2 with the
              sensory layers people asked for.
            </p>
            <p className="p">
              the entire project is open source. documentation, patterns, code,
              and corpus materials are all available so others can take it
              apart, remix it, and make their own.
            </p>
            <p className="p">
              make your own soft computer. or your own computer of any kind. it
              doesn&#39;t have to be soft. it just has to be yours. something
              built around your values, not someone else&#39;s.
            </p>

            <h2 className="h2">audience + context</h2>
            <div className="aboutTwoCol">
              <div className="aboutCard">
                <div className="aboutLabel">who it is for</div>
                <ul className="aboutList">
                  <li>
                    creative technologists, makers, artists, and designers
                    seeking alternatives to optimization culture
                  </li>
                  <li>
                    hci researchers and educators interested in feminist hci,
                    calm tech, and embodied interaction
                  </li>
                </ul>
              </div>
              <div className="aboutCard">
                <div className="aboutLabel">out in the world</div>
                <ul className="aboutList">
                  <li>installation context, public interaction</li>
                  <li>itp thesis show @ nyc resistor, april 2026</li>
                  <li>itp/ima spring show, may 2026</li>
                  <li>open hardware summit, berlin, may 2026</li>
                </ul>
              </div>
            </div>

            <h2 className="h2">documentation + openness</h2>
            <p className="p">
              openness is central. build process, patterns, code, circuit
              strategies, and corpus materials are documented so others can
              adapt the soft computer as a template for gentle, alternative
              interfaces.
            </p>
          </div>

          <aside className="aboutAside">
            <div className="aboutMeta">
              <div className="aboutMetaTitle">project info</div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">project</div>
                <div className="aboutMetaVal">the soft computer</div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">author</div>
                <div className="aboutMetaVal">
                  <a
                    href="https://yafira.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    yafira martinez
                  </a>
                </div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">context</div>
                <div className="aboutMetaVal">
                  nyu itp — interactive telecommunications program
                </div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">materials</div>
                <div className="aboutMetaVal">
                  soft materials, machine-knit yarn, industrial felt, neoprene,
                  conductive fabric, flexible e-ink, embedded electronics
                </div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">categories</div>
                <div className="aboutMetaVal">
                  physical computing · textile interfaces · interaction design ·
                  electronic text
                </div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">form</div>
                <div className="aboutMetaVal">
                  13&Prime; tall &times; 16&Prime; wide &times; 10&Prime; deep,
                  soft materials enclosure with machine-knit wool accents over
                  industrial felt over carved upholstery foam
                </div>
              </div>
              <div className="aboutMetaRow">
                <div className="aboutMetaKey">exhibitions</div>
                <div className="aboutMetaVal">
                  itp thesis show @ nyc resistor, itp/ima spring show, open
                  hardware summit berlin
                </div>
              </div>
            </div>
            <div className="aboutMeta" style={{ marginTop: 12 }}>
              <div className="aboutMetaTitle">keywords</div>
              <div className="aboutChips">
                {[
                  "textile interfaces",
                  "embedded electronics",
                  "physical computing",
                  "electronic text",
                  "e-textiles",
                  "calm technology",
                  "slow technology",
                  "tangible interaction",
                  "capacitive sensing",
                  "soft circuits",
                  "embodied interaction",
                  "poetic computation",
                  "material memory",
                  "thermal printing",
                  "receipt artifacts",
                  "soft os",
                  "soft interfaces",
                  "anti-optimization",
                  "critical making",
                  "speculative hardware",
                  "feminist hci",
                  "computational text",
                  "interpretable systems",
                  "craft as logic",
                  "haptic interaction",
                  "multisensory design",
                  "proprioception",
                  "machine knitting",
                  "e-ink display",
                  "open hardware",
                ].map((k) => (
                  <span key={k} className="chip">
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div className="aboutMeta" style={{ marginTop: 12 }}>
              <div className="aboutMetaTitle">lineage</div>
              <ul className="aboutList small">
                <li>
                  alexis clairaut — employed human &ldquo;computers&rdquo; to
                  predict halley&#39;s comet, 1757
                </li>
                <li>jacquard loom — punched cards as pattern logic, 1804</li>
                <li>
                  ada lovelace — computation described through weaving
                  metaphors, 1843
                </li>
                <li>
                  eniac programmers — six women who wired and programmed the
                  first computer, 1945
                </li>
                <li>
                  apollo rope core memory — woven by hand at raytheon,
                  predominantly by women, 1960s
                </li>
                <li>
                  lillian schwartz — early computational art and
                  textile-adjacent aesthetics, 1960s&ndash;70s
                </li>
                <li>
                  hannah perner-wilson — e-textile lab and open soft circuit
                  research
                </li>
                <li>
                  leah buechley — lilypad arduino and wearable computing for
                  makers
                </li>
                <li>
                  irene posch — embroidered computers and craft as computation
                </li>
                <li>XS labs — reactive garments and soft interaction design</li>
                <li>calm technology — weiser and brown, 1996</li>
                <li>
                  tangible bits — ishii and ullmer, embodied interaction, 1997
                </li>
                <li>
                  feminist hci — bardzell, 2010 — values, plurality, embodiment
                </li>
                <li>
                  repair culture and slow tech — jackson, broken world thinking,
                  2014
                </li>
                <li>
                  olia lialina — net artist and media theorist arguing for the
                  visible computer and the rights of users, 1996&ndash;present
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
