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
              computational artifact: a soft interactive form that senses touch
              and pressure, runs a small state-based system, displays ambient
              poetic text, and produces thermal receipts as physical traces of
              interaction.
            </p>

            <p className="p">
              the soft computer is designed to be sat with, not operated. it
              emphasizes presence over output, care over command, and material
              memory over digital abstraction. interaction is intentionally
              minimal and legible. gestures such as touch, holding, or pressure
              shifts the system’s pacing and language. the display reveals slow
              text and system moods, while the printer records encounters
              through short poems, temporal fragments, and subtle residues of
              prior use.
            </p>

            <h2 className="h2">central question</h2>
            <p className="p">
              what becomes possible when we design computers around softness
              rather than hardness, and around care rather than command?
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
                    likely around two to six, depending on reliability and
                    clarity
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
              described computation through weaving. the soft computer draws
              from that thread while insisting that softness can be a rigorous
              interface, not a metaphor.
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
              you could hold, rather than files stored in invisible clouds?
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
                    soft sensing zones distributed across the textile surface
                  </li>
                  <li>
                    likely around two to six, depending on reliability and
                    clarity
                  </li>
                  <li>
                    touch and pressure are the primary interaction materials
                  </li>
                </ul>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">outputs</div>
                <ul className="aboutList">
                  <li>display: e-ink preferred for calmness</li>
                  <li>thermal printer: primary output, ritual receipts</li>
                  <li>optional small peripheral only if core is stable</li>
                </ul>
              </div>
            </div>

            <h2 className="h2">soft os states</h2>
            <div className="aboutThreeCol">
              <div className="aboutCard">
                <div className="aboutLabel">wake</div>
                <p className="p small">
                  a short ritual. the display greets you. a small opener receipt
                  prints with a timestamp and one line.
                </p>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">play</div>
                <p className="p small">
                  active interaction. touch and pressure shift the mood of the
                  text engine. printing is intentional and rate-limited.
                </p>
              </div>

              <div className="aboutCard">
                <div className="aboutLabel">dream</div>
                <p className="p small">
                  idle ambient mode. the display drifts with self-generated
                  text. rare dream residue receipts may appear.
                </p>
              </div>
            </div>
            <section className="knownsUnknowns">
              <div className="kuBlock">
                <div className="kuTitle">the knowns</div>
                <div className="kuSubtitle">what’s already underway</div>

                <ul>
                  <li>
                    conductive textile swatches tested for capacitive and
                    pressure sensing
                  </li>
                  <li>
                    soft, foam-based functional button experiments to study
                    tactile feel and responsiveness
                  </li>
                  <li>
                    early arduino sketches mapping touch and pressure to system
                    states
                  </li>
                  <li>
                    thermal printer tests exploring receipt length, pacing, and
                    paper types
                  </li>
                  <li>
                    preliminary interaction flow: invitation → presence →
                    imprint
                  </li>
                  <li>
                    early form studies exploring soft enclosure and component
                    placement
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
                    calibrating touch and pressure so interaction feels
                    intentional, not noisy
                  </li>
                  <li>
                    balancing poetic openness with interaction clarity for
                    first-time users
                  </li>
                </ul>

                <div className="kuMiniTitle">how i’ll address them</div>
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
              in parallel, i am taking reading and writing electronic text, a
              course centered on computational text and small-scale predictive
              models. rather than relying on large opaque language models, the
              soft computer uses lightweight and legible methods, small
              probabilistic systems, curated corpora, and modest models that
              align with the project’s values of transparency, slowness, and
              materiality.
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
                    calm tech, embodied interaction
                  </li>
                </ul>
              </div>
              <div className="aboutCard">
                <div className="aboutLabel">where it lives</div>
                <ul className="aboutList">
                  <li>installation context, public interaction</li>
                  <li>itp spring show and future exhibitions</li>
                  <li>receipts act as traces of shared time</li>
                </ul>
              </div>
            </div>

            <h2 className="h2">documentation + openness</h2>
            <p className="p">
              openness is central. build process, patterns, code, and circuit
              strategies will be documented so others can adapt the soft
              computer as a template for gentle, alternative interfaces.
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
                <div className="aboutMetaVal">yafira martinez</div>
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
                  textile interface, physical computing, installation
                </div>
              </div>
            </div>

            <div className="aboutMeta" style={{ marginTop: 12 }}>
              <div className="aboutMetaTitle">keywords</div>
              <div className="aboutChips">
                {[
                  "e-textiles",
                  "capacitive sensing",
                  "thermal printing",
                  "soft circuits",
                  "soft os",
                  "feminist hci",
                  "calm technology",
                  "embodied interaction",
                  "critical making",
                  "speculative design",
                  "material memory",
                  "anti-optimization",
                  "computational text",
                  "lightweight ml",
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
                <li>jacquard loom and punch cards</li>
                <li>ada lovelace and woven metaphors</li>
                <li>eniac wiring labor</li>
                <li>apollo rope core memory</li>
                <li>e-textile pioneers and open diy lineages</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
