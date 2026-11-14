import ChainDemo from "@/components/ChainDemo";

export const metadata = {
  title: "language • soft.computer",
  description:
    "how the soft computer writes: four small corpora, a markov chain, and why some of it doesn't make sense.",
};

export default function LanguagePage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h1" style={{ marginBottom: 6 }}>
          language
        </div>
        <p className="p subtle" style={{ marginTop: 0 }}>
          where the words on this screen come from, how they get put together,
          and why some of them don&#39;t make sense.
        </p>

        <h2 className="h2" id="where">
          where the words come from
        </h2>
        <p className="p">
          every poem here is made from one of four small texts i wrote and
          collected. each felt button has its own: lineage, dreamlike, textile,
          subverted. a text is only sixteen lines long. the computer
          has never read anything else.
        </p>
        <p className="p">
          there is no large language model and nothing is sent anywhere. the
          computer can only use words it has already seen, in the small world i
          made for it.
        </p>

        <h2 className="h2" id="how">
          how a markov chain works
        </h2>
        <p className="p">
          before anything is written, the computer reads its text once and keeps
          a list. for every pair of words that sit next to each other, it notes
          which word came right after. that list is the whole model.
        </p>
        <p className="p">
          to write, it starts with any two words. it looks them up, picks one of
          the words that followed them, and adds it. then it looks at the newest
          two words and does the same thing again. thirty words later it stops.
        </p>
        <p className="p">
          this is called an order-2 markov chain, because it only ever looks
          back two words. you can try it one word at a time:
        </p>

        <ChainDemo />

        <h2 className="h2" id="nonsense">
          why some of it doesn&#39;t make sense
        </h2>
        <p className="p">
          the chain remembers two words and nothing before them. it doesn&#39;t
          know what a sentence is, where one started, or what it was about. so
          a line can begin with ada lovelace and end inside a knitting pattern,
          as long as each small step was something the text really said.
        </p>
        <p className="p">
          a few other things add to it. all punctuation is taken out before the
          computer reads, so sentences run into each other. the texts are small,
          so sometimes a pair of words only ever had one word after it, and the
          computer repeats a whole phrase exactly. when it reaches a pair that
          nothing followed, it jumps to a random place and carries on. and it
          stops at thirty words, even in the middle of a thought.
        </p>
        <p className="p">
          i left it this way on purpose. a longer memory would only copy my
          sentences back to me. two words is where the text starts to drift,
          and the drift is the part i find worth reading. you fill in the
          meaning yourself.
        </p>

        <h2 className="h2" id="object">
          on the actual soft computer
        </h2>
        <p className="p">
          the object works the same way this site does. it waits with a flower
          on the e-ink screen. when the matrix pad senses someone, it says
          hello. each of the four felt buttons draws from its own text, and the
          words appear on the screen at the speed e-ink allows, which is slow.
        </p>
        <p className="p">
          everything runs inside the object. there is no internet connection,
          and nothing you press or say leaves it.
        </p>
      </section>
    </main>
  );
}
