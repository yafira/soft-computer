// the four small corpora and the order-2 markov chain that speaks from them
export const RAW_CORPORA = {
  blush: `
    ada lovelace wrote that the engine might weave algebraic patterns just as the jacquard loom weaves flowers and leaves.
    she understood computation before the machine existed. she called it poetry in numbers.
    six women programmed eniac by hand. they were called computers. their names were not in the photographs.
    jean jennings bartik traced the logic with her fingers until the machine responded.
    the rope core memory that guided apollo to the moon was woven by women at raytheon.
    they threaded copper wire through ferrite rings by hand. thousands of cores. one bit each.
    margaret hamilton wrote the code that landed the spacecraft and named it software before that word existed.
    grace hopper found the first real bug. a moth. she taped it into the logbook and kept working.
    hedy lamarr invented frequency hopping spread spectrum. the patent expired before the world caught up.
    women at bell labs kept the network running. they were called assistants.
    the field hardened and the names disappeared but the work did not.
    computation has always been touched by careful hands. the hands were often women's.
    the thread runs through all of it. you can follow it back if you look.
    ada wrote the engine might act upon other things besides number. she meant language. she meant this.
    before the machine there was a body doing the calculation. before the program there was a pattern.
    the loom came first. the computer came after. the lineage is unbroken.
  `,
  blue: `
    language arrives slowly when you stop asking it to hurry.
    a word comes. then another. then a silence that belongs to the poem too.
    the poem does not know it is a poem. neither do you when you are inside it.
    to read is to be changed by what you read. the machine does not know this. you do.
    some sentences know how they end. others keep going until something stops them.
    the display holds what the corpus gave it. it does not reach for more.
    something moves between the touching and the text. that movement is the poem.
    slow down. the language is still arriving. it does not need you to rush it.
    presence is the only input the machine truly responds to. everything else is noise.
    the text is not a message. it is a trace. you are reading the trace of a thought.
    a poem does not explain itself. it invites you into the not knowing.
    this machine was designed to wait. it has been waiting. it is still waiting.
    what arrives is never exactly what you expected. that gap is where meaning lives.
    the cursor blinks. the word comes. you did not make it. you received it.
    softness is not a failure of precision. it is a different kind of knowing.
    the machine breathes at its own pace. you can match it or you can leave.
  `,
  mint: `
    the jacquard loom encoded pattern as hole and not-hole. one and zero. presence and absence.
    binary logic was first expressed in thread before it was expressed in silicon.
    each stitch is a stored state. the fabric remembers every decision made in its making.
    knit one purl two is a program written in wool and executed by hand.
    the pattern card is the program. the loom is the processor. the weaver is the operator.
    weaving is computation at four miles per hour. it has always been computation.
    a quilt contains logic that silicon only borrowed and forgot to credit.
    the kh-930 knitting machine was built in 1986. it is older than most of what we call modern computing.
    tension is a parameter. gauge is a specification. yarn weight is a variable.
    every textile is a data structure. every row is a line of code.
    the thread holds its last position. this is memory. the fabric does not forget.
    when you weave you are writing. the cloth is the output. the hand is the compiler.
    the loom came before the computer but they are the same idea in different materials.
    computation was always woven. we stopped seeing it when we moved it into boxes.
    the needle passes through the warp. the state changes. the pattern advances. this is logic.
    soft circuits are not a metaphor. they are the original form.
  `,
  yellow: `
    error softness not found in the standard library. installing from source.
    undefined behavior the interface asked how you were doing and waited for the answer.
    while present do breathe wait notice notice again end.
    the function returned something no one anticipated. the type was warmth. compilation succeeded.
    deprecated the urgency module. reason it was making everything worse.
    memory leak detected in the optimization loop. the machine kept remembering things it was told to discard.
    the loop interrupted itself to look out the window. no exception was thrown.
    null pointer exception no one was rushing. the program continued anyway.
    the compiler issued a warning this expression evaluates to care. treat with attention.
    segmentation fault the machine crossed a boundary it was not supposed to cross. it was worth it.
    the stack overflowed with something resembling patience. the program did not crash.
    this button does not optimize you. it does not have that function. it was never in the spec.
    the documentation does not describe this output. it was not intended. it arrived on its own.
    end of file reached. the poem continued past the end of the file. this is normal behavior.
    the output is a poem. this was a side effect. side effects are sometimes the whole point.
    reboot not required. the soft state persists between sessions. this is by design.
  `,
};

export function buildChain(text, n = 2) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 0 && w !== "undefined");
  const chain = {};
  for (let i = 0; i < words.length - n; i++) {
    const key = words.slice(i, i + n).join(" ");
    const next = words[i + n];
    if (!chain[key]) chain[key] = [];
    chain[key].push(next);
  }
  return chain;
}

export function generate(chain, length) {
  const keys = Object.keys(chain);
  if (!keys.length) return "";
  let key = keys[Math.floor(Math.random() * keys.length)];
  const result = key.split(" ").filter(Boolean);
  for (let i = 0; i < length; i++) {
    const options = chain[key];
    if (!options || !options.length) {
      key = keys[Math.floor(Math.random() * keys.length)];
      continue;
    }
    const next = options[Math.floor(Math.random() * options.length)];
    if (!next || next === "undefined") {
      key = keys[Math.floor(Math.random() * keys.length)];
      continue;
    }
    result.push(next);
    key = [...key.split(" ").slice(1), next].join(" ");
  }
  return result.filter((w) => w && w !== "undefined").join(" ");
}

export const CHAINS = {};
for (const [k, v] of Object.entries(RAW_CORPORA)) {
  CHAINS[k] = buildChain(v, 2);
}

export const CORPUS_LABELS = {
  blush: "lineage",
  blue: "dreamlike",
  mint: "textile",
  yellow: "subverted",
};
