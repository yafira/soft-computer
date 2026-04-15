import Link from "next/link";

export const metadata = {
  title: "about • soft.computer",
  description:
    "the soft computer is an interactive textile sculpture that reimagines computing as tactile, slow, and caring.",
};

export default function AboutPage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h1" style={{ marginBottom: 6 }}>
          about
        </div>
        <p className="p subtle" style={{ marginTop: 0 }}>
          the soft computer is a thesis project exploring textiles as
          computational logic.
        </p>

        <div className="aboutGrid">
          <div className="aboutMain">
            <h2 className="h2">the soft computer</h2>

            <p className="p">
              the soft computer is a soft, textile-based computing object that
              uses touch, craft, and embedded electronics to imagine gentler,
              more intimate ways of interacting with technology. rather than
              functioning as a productivity machine, it operates as a standalone
              computational artifact: a sewn textile enclosure with machine-knit
              wool accents, housing a flexible e-ink display, capacitive textile
              sensing zones, a haptic heartbeat, ambient sound, and breathing
              light — a full sensory system designed around care, not command.
            </p>

            <p className="p">
              the soft computer is designed to be sat with, not operated. it
              emphasizes presence over output, care over command, and material
              memory over digital abstraction. four plush textile buttons act as
              a poetic keyboard, each biasing a markov chain toward a different
              emotional corpus. a trackpad-like zone controls the mood of
              language generation. the sides sense when the object is being
              held. the top holds a secret. a flexible e-ink screen slowly
              builds poems from touch.
            </p>

            <h2 className="h2">central question</h2>
            <p className="p">
              what can a soft computer do that a hard computer never could?
            </p>
            <p className="p">
              what becomes possible when we design computers around softness
              rather than hardness — around care rather than command?
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
                    how a markov chain corpus can generate poetry that feels
                    discovered rather than produced
                  </li>
                  <li>
                    how printed output can create material memory and intimacy
                  </li>
                  <li>
                    what it means to design for slowness, legibility, and
                    anti-optimization
                  </li>
                  <li>what happens when a computer responds to being held</li>
                </ul>
              </div>
            </div>

            <h2 className="h2">motivation</h2>
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
              alexis clairaut employed two human &ldquo;computers&rdquo; — the
              title for apprentices at the time — to refine halley&apos;s comet
              predictions. before the machine, computation was a body. the soft
              computer draws from that thread while insisting that softness can
              be a rigorous interface, not a metaphor.
            </p>

            <p className="p">
              as computing industrialized, its soft origins were systematically
              erased. women who wired eniac, who wove rope core memory for
              apollo, and who performed invisible computational labor were
              framed as assistants rather than inventors. meanwhile computing
              hardened. speed became virtue. precision became power.
            </p>

            <p className="p">
              the soft computer argues that softness is not weakness. softness
              is the ability to flex, mend, feel, and adapt. what if computers
              were companions of care? what if computation produced artifacts
              you could hold, rather than files stored in invisible clouds? what
              if a computer had a heartbeat?
            </p>

            <h2 className="h2">what it means to build a soft computer</h2>
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

            <h2 className="h2">system form</h2>
            <div className="aboutTwoCol">
              <div className="aboutCard">
                <div className="aboutLabel">inputs</div>
                <ul className="aboutList">
                  <li>
                    4 plush textile buttons — poetic keyboard, each biasing a
                    markov corpus toward a different emotional register
                  </li>
                  <li>
                    trackpad zone — controls the mood and temperature of
                    language generation through gesture
                  </li>
                  <li>
                    side hug sensors — capacitive zones detect when both sides
                    are held simultaneously
                  </li>
                  <li>
                    top arch — secret hidden zone, discovered through curiosity
                    not instruction
                  </li>
                </ul>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">outputs</div>
                <ul className="aboutList">
                  <li>
                    flexible 10.3&Prime; e-ink display — slow poetic text builds
                    word by word, corner shows current system mood
                  </li>
                  <li>
                    haptic heartbeat — vibration motor pulses like a living
                    thing at idle
                  </li>
                  <li>
                    NeoPixel breathing light — color shifts with OS state,
                    blooms through fabric
                  </li>
                  <li>
                    ambient sound — soft tonal breathing via built-in speaker,
                    shifts with interaction
                  </li>
                  <li>
                    thermal printer — ritual receipts as poem artifacts (bonus
                    feature)
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="h2">interactions</h2>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <div className="aboutLabel">poetic keyboard</div>
                <p className="p small">
                  four plush buttons each bias a markov chain toward a different
                  corpus — care and tenderness, computational language
                  subverted, textile and weaving vocabulary, dreamlike
                  abstraction. pressing combinations builds a poem line by line.
                  the constraint is the point: limitation producing unexpected
                  richness, like warp and weft producing infinite patterns.
                </p>
              </div>
              <div className="aboutCallout">
                <div className="aboutLabel">mood shifter</div>
                <p className="p small">
                  the trackpad zone controls the emotional temperature of
                  generation. a slow drag pulls tender quiet words. a fast
                  stroke produces urgency and fragmentation. resting your whole
                  palm pauses everything — the screen holds the current line
                  like a held breath.
                </p>
              </div>
              <div className="aboutCallout">
                <div className="aboutLabel">hug sensor</div>
                <p className="p small">
                  when someone wraps both hands around the sides simultaneously,
                  the system knows it is being held. the heartbeat quickens. the
                  sound shifts warmer. the screen shows a line only visible in
                  this moment. a hard computer has no input for embrace. this
                  one does.
                </p>
              </div>
              <div className="aboutCallout">
                <div className="aboutLabel">the secret</div>
                <p className="p small">
                  no label. no instruction. the top arch responds to a patient
                  hand — a rare poem appears that never surfaces through any
                  other interaction. children find it by instinct. adults find
                  it by accident. people tell others.
                </p>
              </div>
            </div>

            <h2 className="h2">sensory system</h2>
            <p className="p">
              the soft computer engages four senses simultaneously — unusual for
              a computing object — plus one often overlooked:
            </p>
            <div className="aboutCallouts">
              <div className="aboutCallout">
                <ul className="aboutList">
                  <li>
                    <strong>touch</strong> — plush mixed-material buttons, sewn
                    textile surface with knit wool accents, haptic heartbeat
                  </li>
                  <li>
                    <strong>sight</strong> — slow poetic text on flexible e-ink,
                    NeoPixel breathing light through fabric
                  </li>
                  <li>
                    <strong>sound</strong> — ambient breathing via fruit jam
                    built-in speaker, tonal shifts with interaction
                  </li>
                  <li>
                    <strong>proprioception</strong> — the sense of your own body
                    in space. the object has weight. you hold it, cradle it,
                    wrap your hands around it. a screen has no body. this does.
                  </li>
                </ul>
              </div>
            </div>
            <p className="p">
              and one design principle that runs through all of them:{" "}
              <strong>slowness</strong>. the piece is rate-limited and
              intentional. it resists speed. in a world of optimized interfaces,
              the soft computer asks you to wait, to stay, to notice. that
              experience of time — slowed down, made physical — is itself
              something a hard computer cannot give you.
            </p>

            <h2 className="h2">soft os states</h2>
            <div className="aboutThreeCol">
              <div className="aboutCard">
                <div className="aboutLabel">wake</div>
                <p className="p small">
                  a short ritual. the display greets you. the NeoPixel brightens
                  slowly. the haptic pulse begins. the object orients itself
                  toward presence.
                </p>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">play</div>
                <p className="p small">
                  active interaction. buttons and trackpad generate poetry word
                  by word. the heartbeat is steady. sound shifts with mood.
                  light shifts with state.
                </p>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">dream</div>
                <p className="p small">
                  idle ambient mode. the display drifts with self-generated
                  text. the NeoPixel dims. breathing slows. the object waits,
                  alive, for someone to return.
                </p>
              </div>
            </div>

            <section className="knownsUnknowns">
              <div className="kuBlock">
                <div className="kuTitle">the knowns</div>
                <div className="kuSubtitle">what&apos;s already underway</div>

                <ul>
                  <li>
                    conductive textile swatches tested for capacitive sensing
                  </li>
                  <li>
                    soft, foam-based functional button experiments studying
                    tactile feel and responsiveness
                  </li>
                  <li>fruit jam + pi confirmed as core electronics platform</li>
                  <li>flexible 10.3&Prime; e-ink screen ordered</li>
                  <li>
                    markov chain text engine in development alongside reading
                    and writing electronic text coursework
                  </li>
                  <li>
                    sewn enclosure as primary construction method, with two
                    small kh-930 accent pieces: trackpad swatch and screen frame
                    panel in macintosh beige and soft lavender
                  </li>
                  <li>
                    preliminary interaction flow: invitation &rarr; presence
                    &rarr; imprint
                  </li>
                  <li>
                    form studies complete: arched enclosure approximately
                    13&Prime; tall &times; 16&Prime; wide &times; 10&Prime; deep
                  </li>
                </ul>
              </div>

              <div className="kuBlock">
                <div className="kuTitle">the unknowns</div>
                <div className="kuSubtitle">open questions</div>

                <ul>
                  <li>
                    long-term reliability of soft sensing materials under
                    repeated use
                  </li>
                  <li>
                    calibrating capacitive zones so interaction feels
                    intentional, not noisy
                  </li>
                  <li>
                    balancing poetic openness with interaction clarity for
                    first-time users
                  </li>
                  <li>
                    whether warmth and thermal printing will be stable enough
                    for the show
                  </li>
                </ul>

                <div className="kuMiniTitle">how i&apos;ll address them</div>
                <ul>
                  <li>early material testing and stress cycles</li>
                  <li>locking input zones and thresholds quickly</li>
                  <li>
                    short user tests focused on clarity and feel, not features
                  </li>
                </ul>
              </div>
            </section>

            <h2 className="h2">text generation</h2>
            <p className="p">
              in parallel, i am taking reading and writing electronic text with
              allison parrish, a course centered on computational text, natural
              language processing, and small-scale predictive models including
              markov chains. rather than relying on large opaque language
              models, the soft computer uses lightweight and interpretable
              methods — small probabilistic systems, curated corpora, and modest
              models that align with the project&apos;s values of transparency,
              slowness, and materiality. each of the four buttons biases the
              system toward a different emotional corpus. the poem is built from
              touch.
            </p>

            <h2 className="h2">audience + context</h2>
            <div className="aboutTwoCol">
              <div className="aboutCard">
                <div className="aboutLabel">who it is for</div>
                <ul className="aboutList">
                  <li>
                    everyone. the soft computer is designed for all ages —
                    children who touch without hesitation, adults who slow down
                    and become curious, anyone who has ever felt alienated by
                    the hardness of machines
                  </li>
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
                <div className="aboutLabel">where it lives</div>
                <ul className="aboutList">
                  <li>installation context, public interaction</li>
                  <li>itp spring show 2026</li>
                  <li>open hardware summit, berlin, may 2026</li>
                  <li>receipts act as traces of shared time</li>
                  <li>
                    the object needs only one wall outlet and a stable surface
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="h2">documentation + openness</h2>
            <p className="p">
              openness is central. build process, patterns, code, circuit
              strategies, and corpus materials will be documented so others can
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
                <div className="aboutMetaKey">medium</div>
                <div className="aboutMetaVal">
                  textile interface, physical computing, computational text,
                  installation, e-textiles, markov chain poetry
                </div>
              </div>

              <div className="aboutMetaRow">
                <div className="aboutMetaKey">form</div>
                <div className="aboutMetaVal">
                  13&Prime; tall &times; 16&Prime; wide &times; 10&Prime; deep,
                  sewn textile enclosure with machine-knit wool accents over
                  industrial felt over carved upholstery foam
                </div>
              </div>

              <div className="aboutMetaRow">
                <div className="aboutMetaKey">exhibitions</div>
                <div className="aboutMetaVal">
                  itp thesis show @ nyc resistor, itp/ima spring show, open
                  hardware summit berlin, date: TBD
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
                  "markov chain",
                  "small ml",
                  "interpretable systems",
                  "craft as logic",
                  "haptic interaction",
                  "multisensory design",
                  "proprioception",
                  "machine knitting",
                  "NeoPixel",
                  "e-ink display",
                  "all ages",
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
                  predict halley&apos;s comet, 1757
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
