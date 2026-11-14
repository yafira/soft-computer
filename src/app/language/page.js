import ChainDemo from "@/components/ChainDemo";

export const metadata = {
  title: "language • soft.computer",
  description:
    "how the soft computer writes: poetic computation, four small corpora, a markov chain and its relatives, and why some of it doesn't make sense.",
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
          why some of them don&#39;t make sense, and the tradition they belong
          to.
        </p>

        <h2 className="h2" id="poetic">
          poetic computation
        </h2>
        <p className="p">
          most software is built to be useful: faster, more accurate, more
          efficient. poetic computation uses the same tools for a different
          reason. the code is written to say something, or to make you feel
          something, and whether it is useful is beside the point.
        </p>
        <p className="p">
          the soft computer sits in that tradition. it has a processor, a
          screen, and inputs, like any computer. but what it gives back is a
          poem. a tool gives you an answer and you move on. a poem asks you to
          stay with it and decide what it means.
        </p>
        <p className="p">
          the code can be poetic too. the model here is small enough to read in
          a minute and to work out by hand. nothing is hidden. i think of that
          as part of the piece, the same way a visible stitch is.
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

        <h2 className="h2" id="relatives">
          relatives of the markov chain
        </h2>
        <p className="p">
          people were writing with chance and rules long before this, with and
          without computers. these are some of the methods closest to what the
          soft computer does.
        </p>
        <ul className="aboutList" style={{ marginBottom: 14 }}>
          <li>
            <strong>markov&#39;s own experiment (1913).</strong> andrey markov
            counted vowels and consonants in the first 20,000 letters of
            pushkin&#39;s eugene onegin, to show that each letter depends on
            the one before it. the chain is named after him.
          </li>
          <li>
            <strong>the dada poem (1920).</strong> tristan tzara&#39;s recipe:
            cut the words out of a newspaper article, shake them in a bag, and
            copy them down in the order you pull them out. pure chance, no
            memory at all.
          </li>
          <li>
            <strong>shannon&#39;s approximations (1948).</strong> claude
            shannon built english-looking sentences by choosing each word from
            the words that followed the previous one in a book. it is the same
            method as this page, done by hand.
          </li>
          <li>
            <strong>love letters (1952).</strong> christopher strachey wrote a
            program for the manchester computer that filled a letter template
            with random affectionate words. one of the first pieces of
            computer-made writing.
          </li>
          <li>
            <strong>stochastic texts (1959).</strong> theo lutz used sixteen
            subjects and sixteen predicates from kafka&#39;s the castle, and
            had a zuse z22 combine them into new sentences.
          </li>
          <li>
            <strong>the cut-up (late 1950s).</strong> brion gysin and william
            burroughs sliced finished pages into pieces and rearranged them.
            a markov chain is a very fine cut-up: it cuts after every word.
          </li>
          <li>
            <strong>oulipo (1960 onward).</strong> writers who made rules
            instead of using chance. n+7 swaps every noun for the seventh noun
            after it in the dictionary. raymond queneau&#39;s hundred thousand
            billion poems is ten sonnets cut into strips, so any line can pair
            with any other.
          </li>
          <li>
            <strong>a house of dust (1967).</strong> alison knowles and james
            tenney wrote a program that fills the same four-line pattern with
            materials, places, lights, and inhabitants chosen at random.
          </li>
          <li>
            <strong>grammars.</strong> instead of learning from a text, you
            write the sentence shapes yourself and let the computer fill the
            slots. tools like tracery work this way. it gives more control and
            fewer surprises than a chain.
          </li>
          <li>
            <strong>large language models.</strong> a distant relative. they
            also choose the next word from what came before, but they look
            back thousands of words and have learned from far more text than
            anyone could read. the soft computer goes the other way: two
            words of memory, and a text small enough to know by heart.
          </li>
        </ul>

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
