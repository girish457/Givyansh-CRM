import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideSend, 
  LucideMessageSquare, 
  LucideSearch, 
  LucideUsers, 
  LucideClock, 
  LucideRefreshCw,
  LucideX,
  LucideArrowDown,
  LucideChevronDown
} from "lucide-react";

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  companyId: number;
  createdAt: string;
  reactions?: string;
  replyToId?: number;
  replyToMessage?: string;
  isDeleted?: boolean;
}

interface GlobalChatProps {
  currentUser: {
    id: number;
    name: string;
    role: string;
    email?: string;
    companyId: number;
  } | null;
  height?: string;
  onClose?: () => void;
  onMessagesCountChange?: (unreadCount: number, mentionCount: number) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: [
      { char: "😀", name: "grinning face", keywords: ["smile", "happy", "joy", "grin"] },
      { char: "😃", name: "grinning face with big eyes", keywords: ["happy", "joy", "grin", "smile"] },
      { char: "😄", name: "grinning face with smiling eyes", keywords: ["happy", "joy", "grin", "smile"] },
      { char: "😁", name: "beaming face with smiling eyes", keywords: ["happy", "grin", "smile"] },
      { char: "😆", name: "grinning squinting face", keywords: ["laugh", "haha", "happy"] },
      { char: "😅", name: "grinning face with sweat", keywords: ["hot", "nervous", "sweat"] },
      { char: "😂", name: "face with tears of joy", keywords: ["laugh", "funny", "haha", "tear", "cry"] },
      { char: "🤣", name: "rolling on the floor laughing", keywords: ["laugh", "funny", "rofl", "haha"] },
      { char: "😊", name: "smiling face with smiling eyes", keywords: ["smile", "happy", "warm"] },
      { char: "😇", name: "smiling face with halo", keywords: ["angel", "good", "innocent"] },
      { char: "🙂", name: "slightly smiling face", keywords: ["smile", "okay"] },
      { char: "🙃", name: "upside-down face", keywords: ["silly", "flip", "sarcastic"] },
      { char: "😉", name: "winking face", keywords: ["wink", "flirt", "secret"] },
      { char: "😌", name: "relieved face", keywords: ["relieved", "calm", "peace"] },
      { char: "😍", name: "smiling face with heart-eyes", keywords: ["love", "crush", "heart"] },
      { char: "🥰", name: "smiling face with hearts", keywords: ["love", "affection", "warm"] },
      { char: "😘", name: "face blowing a kiss", keywords: ["love", "kiss", "muah"] },
      { char: "😗", name: "kissing face", keywords: ["kiss"] },
      { char: "😙", name: "kissing face with smiling eyes", keywords: ["kiss"] },
      { char: "😚", name: "kissing face with closed eyes", keywords: ["kiss"] },
      { char: "😋", name: "face savoring food", keywords: ["yum", "delicious", "hungry"] },
      { char: "😛", name: "face with tongue", keywords: ["tongue", "silly", "playful"] },
      { char: "😝", name: "squinting face with tongue", keywords: ["tongue", "silly", "playful"] },
      { char: "😜", name: "winking face with tongue", keywords: ["tongue", "silly", "wink"] },
      { char: "🤪", name: "zany face", keywords: ["crazy", "silly", "wild"] },
      { char: "🤨", name: "face with raised eyebrow", keywords: ["skeptical", "huh", "suspicious"] },
      { char: "🧐", name: "face with monocle", keywords: ["smart", "think", "inspect"] },
      { char: "🤓", name: "nerd face", keywords: ["nerd", "geek", "smart", "glasses"] },
      { char: "😎", name: "smiling face with sunglasses", keywords: ["cool", "sun", "awesome"] },
      { char: "🤩", name: "star-struck", keywords: ["star", "excited", "wow"] },
      { char: "🥳", name: "partying face", keywords: ["party", "celebrate", "birthday"] },
      { char: "😏", name: "smirking face", keywords: ["smirk", "sly", "flirt"] },
      { char: "😒", name: "unamused face", keywords: ["bored", "meh", "unamused"] },
      { char: "😞", name: "disappointed face", keywords: ["sad", "disappointed"] },
      { char: "😔", name: "pensive face", keywords: ["sad", "pensive", "thoughtful"] },
      { char: "😟", name: "worried face", keywords: ["worried", "anxious"] },
      { char: "😕", name: "confused face", keywords: ["confused", "huh"] },
      { char: "🙁", name: "slightly frowning face", keywords: ["sad", "frown"] },
      { char: "☹️", name: "frowning face", keywords: ["sad", "frown"] },
      { char: "😣", name: "persevering face", keywords: ["struggle", "pain"] },
      { char: "😖", name: "confounded face", keywords: ["confounded", "pain"] },
      { char: "😫", name: "tired face", keywords: ["tired", "exhausted"] },
      { char: "😩", name: "weary face", keywords: ["tired", "weary"] },
      { char: "🥺", name: "pleading face", keywords: ["plead", "beg", "sad", "puppy"] },
      { char: "😢", name: "crying face", keywords: ["sad", "cry", "tear"] },
      { char: "😭", name: "loudly crying face", keywords: ["cry", "sad", "sob", "tear"] },
      { char: "😤", name: "face with steam from nose", keywords: ["angry", "mad", "triumph"] },
      { char: "😠", name: "angry face", keywords: ["angry", "mad"] },
      { char: "😡", name: "pouting face", keywords: ["angry", "mad", "pout"] },
      { char: "🤬", name: "face with symbols on mouth", keywords: ["swear", "angry", "cuss"] },
      { char: "🤯", name: "exploding head", keywords: ["mind", "blown", "wow", "explode"] },
      { char: "😳", name: "flushed face", keywords: ["blush", "embarrassed", "shock"] },
      { char: "🥵", name: "hot face", keywords: ["hot", "heat", "summer"] },
      { char: "🥶", name: "cold face", keywords: ["cold", "freeze", "winter"] },
      { char: "😱", name: "face screaming in fear", keywords: ["scared", "fear", "scream", "shock"] },
      { char: "😨", name: "fearful face", keywords: ["scared", "fear"] },
      { char: "😰", name: "anxious face with sweat", keywords: ["nervous", "sweat"] },
      { char: "😥", name: "sad but relieved face", keywords: ["relieved", "sweat", "worry"] },
      { char: "😓", name: "downcast face with sweat", keywords: ["sad", "sweat", "nervous"] },
      { char: "🤗", name: "hugging face", keywords: ["hug", "warm", "thanks"] },
      { char: "🤔", name: "thinking face", keywords: ["think", "hmm", "ponder"] },
      { char: "🤭", name: "face with hand over mouth", keywords: ["gasp", "oops", "laugh"] },
      { char: "🤫", name: "shushing face", keywords: ["quiet", "shh", "silence"] },
      { char: "🤥", name: "lying face", keywords: ["liar", "pinocchio", "false"] },
      { char: "😶", name: "face without mouth", keywords: ["quiet", "speechless"] },
      { char: "😐", name: "neutral face", keywords: ["neutral", "meh", "poker"] },
      { char: "😑", name: "expressionless face", keywords: ["bored", "flat"] },
      { char: "😬", name: "grimacing face", keywords: ["grimace", "awkward", "oops"] },
      { char: "🙄", name: "face with rolling eyes", keywords: ["roll", "annoyed", "whatever"] },
      { char: "😯", name: "hushed face", keywords: ["surprise", "shock"] },
      { char: "😦", name: "frowning face with open mouth", keywords: ["shock", "sad"] },
      { char: "😧", name: "anguished face", keywords: ["sad", "pain"] },
      { char: "😮", name: "face with open mouth", keywords: ["wow", "surprise"] },
      { char: "😲", name: "astonished face", keywords: ["surprise", "wow", "shock"] },
      { char: "🥱", name: "yawning face", keywords: ["tired", "sleepy", "yawn"] },
      { char: "😴", name: "sleeping face", keywords: ["sleep", "zzz", "night"] },
      { char: "🤤", name: "drooling face", keywords: ["yum", "sleep", "drool"] },
      { char: "😪", name: "sleepy face", keywords: ["sleep", "tired"] },
      { char: "😵", name: "knocked out face", keywords: ["dizzy", "dead", "drunk"] },
      { char: "🤐", name: "zipper-mouth face", keywords: ["zip", "secret", "quiet"] },
      { char: "🥴", name: "woozy face", keywords: ["dizzy", "drunk", "weird"] },
      { char: "🤢", name: "nauseated face", keywords: ["sick", "vomit", "gross"] },
      { char: "🤮", name: "face vomiting", keywords: ["sick", "vomit", "gross"] },
      { char: "🤧", name: "sneezing face", keywords: ["sick", "cold", "sneeze"] },
      { char: "😷", name: "face with medical mask", keywords: ["sick", "mask", "doctor"] },
      { char: "🤒", name: "face with thermometer", keywords: ["sick", "fever"] },
      { char: "🤕", name: "face with head-bandage", keywords: ["hurt", "injury", "pain"] },
      { char: "🤑", name: "money-mouth face", keywords: ["money", "rich", "dollar"] },
      { char: "🤠", name: "cowboy hat face", keywords: ["cowboy", "yeehaw", "west"] },
      { char: "😈", name: "smiling face with horns", keywords: ["devil", "evil", "naughty"] },
      { char: "👿", name: "angry face with horns", keywords: ["devil", "evil", "mad"] },
      { char: "👹", name: "ogre", keywords: ["monster", "scary", "mask"] },
      { char: "👺", name: "goblin", keywords: ["monster", "scary", "mask"] },
      { char: "🤡", name: "clown face", keywords: ["clown", "funny", "creepy"] },
      { char: "💩", name: "pile of poo", keywords: ["poop", "poo", "funny", "crap"] },
      { char: "👻", name: "ghost", keywords: ["ghost", "scary", "halloween"] },
      { char: "💀", name: "skull", keywords: ["skull", "skeleton", "dead", "bone"] },
      { char: "☠️", name: "skull and crossbones", keywords: ["skull", "dead", "poison", "danger"] },
      { char: "👽", name: "alien", keywords: ["alien", "space", "ufo"] },
      { char: "👾", name: "alien monster", keywords: ["alien", "game", "retro", "pixel"] },
      { char: "🤖", name: "robot", keywords: ["robot", "computer", "tech"] },
      { char: "🎃", name: "jack-o-lantern", keywords: ["pumpkin", "halloween"] },
      { char: "😺", name: "grinning cat", keywords: ["cat", "happy", "smile"] },
      { char: "😸", name: "grinning cat with smiling eyes", keywords: ["cat", "happy", "smile"] }
    ]
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: [
      { char: "👋", name: "waving hand", keywords: ["wave", "hello", "hi", "bye"] },
      { char: "🤚", name: "raised back of hand", keywords: ["hand", "back", "raise"] },
      { char: "🖐️", name: "hand with fingers splayed", keywords: ["hand", "five", "splay"] },
      { char: "✋", name: "raised hand", keywords: ["hand", "stop", "highfive"] },
      { char: "🖖", name: "vulcan salute", keywords: ["vulcan", "spock", "star", "trek"] },
      { char: "👌", name: "ok hand", keywords: ["ok", "okay", "good", "perfect"] },
      { char: "🤌", name: "pinched fingers", keywords: ["italian", "what", "sarcastic"] },
      { char: "🤏", name: "pinched hand", keywords: ["pinch", "small", "little"] },
      { char: "✌️", name: "victory hand", keywords: ["victory", "peace", "two"] },
      { char: "🤞", name: "crossed fingers", keywords: ["cross", "luck", "hope"] },
      { char: "🤟", name: "love-you gesture", keywords: ["love", "ily", "rock"] },
      { char: "🤘", name: "sign of the horns", keywords: ["rock", "metal", "cool"] },
      { char: "🤙", name: "call me hand", keywords: ["call", "phone", "shaka"] },
      { char: "👈", name: "backhand index pointing left", keywords: ["point", "left", "finger"] },
      { char: "👉", name: "backhand index pointing right", keywords: ["point", "right", "finger"] },
      { char: "👆", name: "backhand index pointing up", keywords: ["point", "up", "finger"] },
      { char: "🖕", name: "middle finger", keywords: ["middle", "finger", "rude"] },
      { char: "👇", name: "backhand index pointing down", keywords: ["point", "down", "finger"] },
      { char: "☝️", name: "index pointing up", keywords: ["point", "up", "finger"] },
      { char: "👍", name: "thumbs up", keywords: ["like", "good", "yes", "ok", "thumbsup"] },
      { char: "👎", name: "thumbs down", keywords: ["dislike", "bad", "no", "thumbsdown"] },
      { char: "✊", name: "raised fist", keywords: ["fist", "power", "raise"] },
      { char: "👊", name: "oncoming fist", keywords: ["fist", "punch", "bump"] },
      { char: "🤛", name: "left-facing fist", keywords: ["fist", "bump", "left"] },
      { char: "🤜", name: "right-facing fist", keywords: ["fist", "bump", "right"] },
      { char: "👏", name: "clapping hands", keywords: ["clap", "congrats", "applause"] },
      { char: "🙌", name: "raising hands", keywords: ["raise", "celebrate", "hooray"] },
      { char: "👐", name: "open hands", keywords: ["open", "hug", "share"] },
      { char: "🤲", name: "palms up together", keywords: ["pray", "book", "offer"] },
      { char: "🤝", name: "handshake", keywords: ["shake", "deal", "agree", "meet"] },
      { char: "🙏", name: "folded hands", keywords: ["pray", "please", "thanks", "namaste"] },
      { char: "✍️", name: "writing hand", keywords: ["write", "pen", "sign"] },
      { char: "💅", name: "nail polish", keywords: ["nail", "polish", "beauty", "diva"] },
      { char: "🤳", name: "selfie", keywords: ["selfie", "camera", "phone"] },
      { char: "💪", name: "flexed biceps", keywords: ["flex", "strong", "power", "muscle"] },
      { char: "🦾", name: "mechanical arm", keywords: ["robot", "strong", "arm"] },
      { char: "🧑‍🤝‍🧑", name: "people holding hands", keywords: ["couple", "friends", "holding", "hands"] },
      { char: "👫", name: "man and woman holding hands", keywords: ["couple", "love", "friends"] },
      { char: "👶", name: "baby", keywords: ["baby", "child", "infant"] },
      { char: "👧", name: "girl", keywords: ["girl", "child", "kid"] },
      { char: "🧒", name: "child", keywords: ["child", "kid"] },
      { char: "👦", name: "boy", keywords: ["boy", "child", "kid"] },
      { char: "👩", name: "woman", keywords: ["woman", "lady", "female"] },
      { char: "🧑", name: "person", keywords: ["person", "human"] },
      { char: "👨", name: "man", keywords: ["man", "male", "guy"] }
    ]
  },
  {
    name: "Nature",
    icon: "🐶",
    emojis: [
      { char: "🐶", name: "dog face", keywords: ["dog", "puppy", "pet", "animal"] },
      { char: "🐱", name: "cat face", keywords: ["cat", "kitty", "pet", "animal"] },
      { char: "🐭", name: "mouse face", keywords: ["mouse", "rodent", "animal"] },
      { char: "🐹", name: "hamster", keywords: ["hamster", "pet", "animal"] },
      { char: "🐰", name: "rabbit face", keywords: ["rabbit", "bunny", "pet", "animal"] },
      { char: "🦊", name: "fox", keywords: ["fox", "animal", "nature"] },
      { char: "🐻", name: "bear", keywords: ["bear", "animal"] },
      { char: "🐼", name: "panda", keywords: ["panda", "animal"] },
      { char: "🐨", name: "koala", keywords: ["koala", "animal"] },
      { char: "🐯", name: "tiger face", keywords: ["tiger", "cat", "animal"] },
      { char: "🦁", name: "lion", keywords: ["lion", "cat", "animal"] },
      { char: "🐮", name: "cow face", keywords: ["cow", "farm", "animal"] },
      { char: "🐷", name: "pig face", keywords: ["pig", "farm", "animal"] },
      { char: "🐸", name: "frog", keywords: ["frog", "amphibian", "animal"] },
      { char: "🐵", name: "monkey face", keywords: ["monkey", "animal"] },
      { char: "🙈", name: "see-no-evil monkey", keywords: ["monkey", "blind", "hide"] },
      { char: "🙉", name: "hear-no-evil monkey", keywords: ["monkey", "deaf", "quiet"] },
      { char: "🙊", name: "speak-no-evil monkey", keywords: ["monkey", "mute", "quiet"] },
      { char: "🐒", name: "monkey", keywords: ["monkey", "animal"] },
      { char: "🐔", name: "chicken", keywords: ["chicken", "bird", "farm"] },
      { char: "🐧", name: "penguin", keywords: ["penguin", "bird", "cold"] },
      { char: "🐦", name: "bird", keywords: ["bird", "fly", "animal"] },
      { char: "🐤", name: "baby chick", keywords: ["chick", "bird", "baby"] },
      { char: "🐣", name: "hatching chick", keywords: ["chick", "egg", "baby"] },
      { char: "🐥", name: "front-facing baby chick", keywords: ["chick", "bird", "baby"] },
      { char: "🦆", name: "duck", keywords: ["duck", "bird", "water"] },
      { char: "🦅", name: "eagle", keywords: ["eagle", "bird", "fly", "nature"] },
      { char: "🦉", name: "owl", keywords: ["owl", "bird", "night"] },
      { char: "🦇", name: "bat", keywords: ["bat", "vampire", "halloween"] },
      { char: "🐺", name: "wolf", keywords: ["wolf", "dog", "animal"] },
      { char: "🐗", name: "boar", keywords: ["boar", "pig", "animal"] },
      { char: "🐴", name: "horse face", keywords: ["horse", "farm", "animal"] },
      { char: "🦄", name: "unicorn", keywords: ["unicorn", "magic", "fantasy"] },
      { char: "🐝", name: "honeybee", keywords: ["bee", "bug", "honey", "insect"] },
      { char: "🪱", name: "worm", keywords: ["worm", "bug", "soil"] },
      { char: "🐛", name: "bug", keywords: ["bug", "caterpillar", "insect"] },
      { char: "🦋", name: "butterfly", keywords: ["butterfly", "bug", "pretty"] },
      { char: "🐌", name: "snail", keywords: ["snail", "bug", "slow"] },
      { char: "🐞", name: "lady beetle", keywords: ["ladybug", "bug", "insect"] },
      { char: "🐜", name: "ant", keywords: ["ant", "bug", "insect"] },
      { char: "🕷️", name: "spider", keywords: ["spider", "bug", "scary", "halloween"] },
      { char: "🕸️", name: "spider web", keywords: ["web", "spider", "halloween"] },
      { char: "🦂", name: "scorpion", keywords: ["scorpion", "bug", "danger"] },
      { char: "🐢", name: "turtle", keywords: ["turtle", "shell", "slow"] },
      { char: "🐍", name: "snake", keywords: ["snake", "reptile", "danger"] },
      { char: "🦎", name: "lizard", keywords: ["lizard", "reptile"] },
      { char: "🐙", name: "octopus", keywords: ["octopus", "sea", "ocean"] },
      { char: "🦑", name: "squid", keywords: ["squid", "sea", "ocean"] },
      { char: "🦞", name: "lobster", keywords: ["lobster", "seafood", "ocean"] },
      { char: "🦀", name: "crab", keywords: ["crab", "seafood", "ocean"] },
      { char: "🐡", name: "blowfish", keywords: ["blowfish", "fish", "ocean"] },
      { char: "🐠", name: "tropical fish", keywords: ["fish", "ocean", "aquarium"] },
      { char: "🐟", name: "fish", keywords: ["fish", "ocean", "sea"] },
      { char: "🐬", name: "dolphin", keywords: ["dolphin", "ocean", "sea"] },
      { char: "🐳", name: "spouting whale", keywords: ["whale", "ocean", "sea"] },
      { char: "🐋", name: "whale", keywords: ["whale", "ocean", "sea"] },
      { char: "🦈", name: "shark", keywords: ["shark", "ocean", "sea", "danger"] },
      { char: "🐊", name: "crocodile", keywords: ["alligator", "crocodile", "animal"] },
      { char: "🐅", name: "tiger", keywords: ["tiger", "animal"] },
      { char: "🐆", name: "leopard", keywords: ["leopard", "animal"] },
      { char: "🦓", name: "zebra", keywords: ["zebra", "animal"] },
      { char: "🦍", name: "gorilla", keywords: ["gorilla", "animal"] },
      { char: "🦧", name: "orangutan", keywords: ["ape", "monkey", "animal"] },
      { char: "🐘", name: "elephant", keywords: ["elephant", "animal"] },
      { char: "🦛", name: "hippopotamus", keywords: ["hippo", "animal"] },
      { char: "🦏", name: "rhinoceros", keywords: ["rhino", "animal"] },
      { char: "🐪", name: "dromedary camel", keywords: ["camel", "desert", "animal"] },
      { char: "🐫", name: "camel", keywords: ["camel", "desert", "animal"] },
      { char: "🦒", name: "giraffe", keywords: ["giraffe", "animal"] },
      { char: "🦘", name: "kangaroo", keywords: ["kangaroo", "australia", "animal"] },
      { char: "🦬", name: "bison", keywords: ["bison", "buffalo", "animal"] },
      { char: "☘️", name: "shamrock", keywords: ["shamrock", "clover", "luck"] },
      { char: "🍀", name: "four leaf clover", keywords: ["clover", "luck", "green"] },
      { char: "🍁", name: "maple leaf", keywords: ["maple", "leaf", "autumn", "fall"] },
      { char: "🍂", name: "fallen leaf", keywords: ["leaf", "autumn", "fall"] },
      { char: "🍃", name: "leaf fluttering in wind", keywords: ["leaf", "wind", "nature"] },
      { char: "🌲", name: "evergreen tree", keywords: ["tree", "pine", "forest"] },
      { char: "🌳", name: "deciduous tree", keywords: ["tree", "forest", "nature"] },
      { char: "🌴", name: "palm tree", keywords: ["tree", "palm", "beach", "summer"] },
      { char: "🌵", name: "cactus", keywords: ["cactus", "desert", "plant"] },
      { char: "🌾", name: "sheaf of rice", keywords: ["rice", "grain", "wheat"] },
      { char: "🌿", name: "herb", keywords: ["herb", "plant", "green"] },
      { char: "🌸", name: "cherry blossom", keywords: ["flower", "cherry", "blossom", "pink"] },
      { char: "💮", name: "white flower", keywords: ["flower", "stamp", "good"] },
      { char: "🪷", name: "lotus", keywords: ["lotus", "flower", "pure"] },
      { char: "🌹", name: "rose", keywords: ["rose", "flower", "love", "red"] },
      { char: "🥀", name: "wilted flower", keywords: ["wilted", "flower", "sad"] },
      { char: "🌺", name: "hibiscus", keywords: ["flower", "pink", "tropical"] },
      { char: "🌻", name: "sunflower", keywords: ["flower", "yellow", "summer"] },
      { char: "🌼", name: "blossom", keywords: ["flower", "yellow"] },
      { char: "🌷", name: "tulip", keywords: ["flower", "tulip", "spring"] },
      { char: "🌱", name: "seedling", keywords: ["plant", "sprout", "grow"] },
      { char: "🪴", name: "potted plant", keywords: ["plant", "house", "pot"] }
    ]
  },
  {
    name: "Food",
    icon: "🍏",
    emojis: [
      { char: "🍏", name: "green apple", keywords: ["apple", "green", "fruit", "food"] },
      { char: "🍎", name: "red apple", keywords: ["apple", "red", "fruit", "food"] },
      { char: "🍊", name: "tangerine", keywords: ["orange", "fruit", "citrus"] },
      { char: "🍋", name: "lemon", keywords: ["lemon", "sour", "citrus"] },
      { char: "🍌", name: "banana", keywords: ["banana", "yellow", "fruit"] },
      { char: "🍉", name: "watermelon", keywords: ["watermelon", "melon", "fruit", "summer"] },
      { char: "🍇", name: "grapes", keywords: ["grapes", "fruit", "wine"] },
      { char: "🍓", name: "strawberry", keywords: ["strawberry", "berry", "fruit"] },
      { char: "🫐", name: "blueberries", keywords: ["blueberry", "berry", "fruit"] },
      { char: "🍈", name: "melon", keywords: ["melon", "fruit", "cantaloupe"] },
      { char: "🍒", name: "cherries", keywords: ["cherry", "fruit"] },
      { char: "🍑", name: "peach", keywords: ["peach", "fruit"] },
      { char: "🥭", name: "mango", keywords: ["mango", "fruit", "tropical"] },
      { char: "🍍", name: "pineapple", keywords: ["pineapple", "fruit", "tropical"] },
      { char: "🥥", name: "coconut", keywords: ["coconut", "fruit", "tropical"] },
      { char: "🥝", name: "kiwi fruit", keywords: ["kiwi", "fruit"] },
      { char: "🍅", name: "tomato", keywords: ["tomato", "vegetable", "red"] },
      { char: "🍆", name: "eggplant", keywords: ["eggplant", "vegetable", "purple"] },
      { char: "🥑", name: "avocado", keywords: ["avocado", "green", "guac"] },
      { char: "🥦", name: "broccoli", keywords: ["broccoli", "vegetable", "green"] },
      { char: "🥬", name: "leafy green", keywords: ["salad", "lettuce", "cabbage", "spinach"] },
      { char: "🥒", name: "cucumber", keywords: ["cucumber", "vegetable", "pickle"] },
      { char: "🌶️", name: "hot pepper", keywords: ["pepper", "chili", "hot", "spicy"] },
      { char: "🫑", name: "bell pepper", keywords: ["pepper", "bell", "vegetable"] },
      { char: "🧅", name: "onion", keywords: ["onion", "vegetable", "cry"] },
      { char: "🧄", name: "garlic", keywords: ["garlic", "vegetable", "stinky"] },
      { char: "🥕", name: "carrot", keywords: ["carrot", "vegetable", "orange"] },
      { char: "🌽", name: "ear of corn", keywords: ["corn", "popcorn", "farm"] },
      { char: "🥔", name: "potato", keywords: ["potato", "starch", "fries"] },
      { char: "🍠", name: "roasted sweet potato", keywords: ["potato", "sweet", "yam"] },
      { char: "🥐", name: "croissant", keywords: ["croissant", "bread", "pastry", "french"] },
      { char: "🍞", name: "bread", keywords: ["bread", "loaf", "toast"] },
      { char: "🥖", name: "baguette bread", keywords: ["baguette", "bread", "pastry", "french"] },
      { char: "🫓", name: "flatbread", keywords: ["roti", "flatbread", "naan", "pita"] },
      { char: "🥨", name: "pretzel", keywords: ["pretzel", "snack", "salty"] },
      { char: "🥯", name: "bagel", keywords: ["bagel", "bread", "breakfast"] },
      { char: "🥞", name: "pancakes", keywords: ["pancake", "breakfast", "syrup"] },
      { char: "🧇", name: "waffle", keywords: ["waffle", "breakfast", "syrup"] },
      { char: "🧀", name: "cheese wedge", keywords: ["cheese", "swiss", "dairy"] },
      { char: "🍖", name: "meat on bone", keywords: ["meat", "bone", "ribs"] },
      { char: "🍗", name: "poultry leg", keywords: ["chicken", "drumstick", "meat", "turkey"] },
      { char: "🥩", name: "cut of meat", keywords: ["steak", "beef", "meat", "pork"] },
      { char: "🥓", name: "bacon", keywords: ["bacon", "pork", "meat", "breakfast"] },
      { char: "🍔", name: "hamburger", keywords: ["burger", "hamburger", "fastfood", "beef"] },
      { char: "🍟", name: "french fries", keywords: ["fries", "chips", "potato", "fastfood"] },
      { char: "🍕", name: "pizza", keywords: ["pizza", "cheese", "fastfood"] },
      { char: "🌭", name: "hot dog", keywords: ["hotdog", "frankfurter", "fastfood"] },
      { char: "🥪", name: "sandwich", keywords: ["sandwich", "lunch", "bread"] },
      { char: "🌮", name: "taco", keywords: ["taco", "mexican", "fastfood"] },
      { char: "🌯", name: "burrito", keywords: ["burrito", "mexican", "wrap"] },
      { char: "🫔", name: "tamale", keywords: ["tamale", "mexican", "wrap"] },
      { char: "🥙", name: "stuffed flatbread", keywords: ["gyro", "falafel", "kebab"] },
      { char: "🧆", name: "falafel", keywords: ["falafel", "chickpea", "balls"] },
      { char: "🥚", name: "egg", keywords: ["egg", "breakfast", "chicken"] },
      { char: "🍳", name: "cooking", keywords: ["egg", "pan", "cook", "fry", "breakfast"] },
      { char: "🥘", name: "shallow pan of food", keywords: ["paella", "pan", "stew", "food"] },
      { char: "🍲", name: "pot of food", keywords: ["stew", "soup", "pot"] },
      { char: "🥣", name: "bowl with spoon", keywords: ["cereal", "soup", "bowl", "breakfast"] },
      { char: "🥗", name: "green salad", keywords: ["salad", "healthy", "vegetable", "green"] },
      { char: "🍿", name: "popcorn", keywords: ["popcorn", "movie", "snack"] },
      { char: "🧈", name: "butter", keywords: ["butter", "dairy", "toast"] },
      { char: "🧂", name: "salt", keywords: ["salt", "shaker", "spice"] },
      { char: "🥫", name: "canned food", keywords: ["can", "soup", "tomato"] },
      { char: "🍱", name: "bento box", keywords: ["bento", "japanese", "lunch"] },
      { char: "🍘", name: "rice cracker", keywords: ["cracker", "rice", "japanese"] },
      { char: "🍙", name: "rice ball", keywords: ["onigiri", "rice", "japanese"] },
      { char: "🍚", name: "cooked rice", keywords: ["rice", "bowl", "asian"] },
      { char: "🍛", name: "curry rice", keywords: ["curry", "rice", "spice", "indian"] },
      { char: "🍜", name: "steaming bowl", keywords: ["ramen", "noodles", "soup", "asian"] },
      { char: "🍝", name: "spaghetti", keywords: ["spaghetti", "pasta", "italian", "noodles"] },
      { char: "🍢", name: "oden", keywords: ["oden", "skewers", "japanese"] },
      { char: "🍣", name: "sushi", keywords: ["sushi", "fish", "japanese", "rice"] },
      { char: "🍤", name: "fried shrimp", keywords: ["shrimp", "tempura", "seafood", "fried"] },
      { char: "🍥", name: "fish cake with swirl", keywords: ["naruto", "ramen", "fishcake"] },
      { char: "🥮", name: "mooncake", keywords: ["mooncake", "chinese", "autumn"] },
      { char: "🍡", name: "dango", keywords: ["dango", "sweet", "skewers", "japanese"] },
      { char: "🥟", name: "dumpling", keywords: ["dumpling", "gyoza", "dimsum"] },
      { char: "🦪", name: "oyster", keywords: ["oyster", "seafood", "ocean"] },
      { char: "🍦", name: "soft ice cream", keywords: ["icecream", "cone", "sweet", "dessert"] },
      { char: "🍧", name: "shaved ice", keywords: ["shavedice", "sweet", "dessert", "cold"] },
      { char: "🍨", name: "ice cream", keywords: ["icecream", "bowl", "sweet", "dessert"] },
      { char: "🍩", name: "donut", keywords: ["donut", "doughnut", "sweet", "dessert"] },
      { char: "🍪", name: "cookie", keywords: ["cookie", "biscuit", "sweet", "chocolate"] },
      { char: "🎂", name: "birthday cake", keywords: ["cake", "birthday", "celebrate", "candles"] },
      { char: "🍰", name: "shortcake", keywords: ["cake", "slice", "sweet", "strawberry"] },
      { char: "🧁", name: "cupcake", keywords: ["cupcake", "sweet", "muffin", "dessert"] },
      { char: "🥧", name: "pie", keywords: ["pie", "sweet", "bake", "apple"] },
      { char: "🍫", name: "chocolate bar", keywords: ["chocolate", "sweet", "candy"] },
      { char: "🍬", name: "candy", keywords: ["candy", "sweet", "sugar"] },
      { char: "🍭", name: "lollipop", keywords: ["lollipop", "sweet", "candy"] },
      { char: "🍮", name: "custard", keywords: ["custard", "pudding", "sweet", "flan"] },
      { char: "🍯", name: "honey pot", keywords: ["honey", "sweet", "pot", "bee"] },
      { char: "🍼", name: "baby bottle", keywords: ["bottle", "baby", "milk"] },
      { char: "🥛", name: "glass of milk", keywords: ["milk", "glass", "drink"] },
      { char: "☕", name: "hot beverage", keywords: ["coffee", "tea", "cafe", "cup", "hot"] },
      { char: "🍵", name: "teacup without handle", keywords: ["tea", "greentea", "matcha", "cup"] },
      { char: "🍶", name: "sake", keywords: ["sake", "bottle", "cup", "japanese"] },
      { char: "🍾", name: "bottle with popping cork", keywords: ["champagne", "celebrate", "bottle", "wine"] },
      { char: "🍷", name: "wine glass", keywords: ["wine", "glass", "drink", "alcohol"] },
      { char: "🍸", name: "cocktail glass", keywords: ["cocktail", "martini", "drink", "alcohol"] },
      { char: "🍹", name: "tropical drink", keywords: ["drink", "cocktail", "beach", "summer"] },
      { char: "🍺", name: "beer mug", keywords: ["beer", "mug", "drink", "alcohol"] },
      { char: "🍻", name: "clinking beer mugs", keywords: ["beers", "cheers", "drink", "party"] },
      { char: "🥂", name: "clinking glasses", keywords: ["cheers", "celebrate", "champagne", "glasses"] },
      { char: "🥃", name: "tumbler glass", keywords: ["whiskey", "glass", "bourbon", "liquor"] },
      { char: "🥤", name: "cup with straw", keywords: ["soda", "drink", "cola", "cup"] },
      { char: "🧋", name: "bubble tea", keywords: ["boba", "bubbletea", "tea", "drink"] },
      { char: "🧉", name: "mate", keywords: ["mate", "drink", "argentina"] },
      { char: "🧊", name: "ice", keywords: ["ice", "cube", "cold"] }
    ]
  },
  {
    name: "Travel",
    icon: "🚗",
    emojis: [
      { char: "🚗", name: "automobile", keywords: ["car", "auto", "vehicle", "drive"] },
      { char: "🚕", name: "taxi", keywords: ["taxi", "cab", "vehicle", "ride"] },
      { char: "🚙", name: "sport utility vehicle", keywords: ["car", "suv", "vehicle", "drive"] },
      { char: "🚌", name: "bus", keywords: ["bus", "vehicle", "transport"] },
      { char: "🏎️", name: "racing car", keywords: ["racecar", "race", "speed", "f1"] },
      { char: "🚓", name: "police car", keywords: ["police", "cop", "siren", "car"] },
      { char: "🚑", name: "ambulance", keywords: ["ambulance", "er", "hospital", "emergency"] },
      { char: "🚒", name: "fire engine", keywords: ["fire", "engine", "truck", "emergency"] },
      { char: "🚐", name: "minibus", keywords: ["minibus", "bus", "van"] },
      { char: "🛻", name: "pickup truck", keywords: ["truck", "pickup", "car"] },
      { char: "🚚", name: "delivery truck", keywords: ["truck", "delivery", "shipping"] },
      { char: "🚜", name: "tractor", keywords: ["tractor", "farm", "vehicle"] },
      { char: "🛵", name: "motor scooter", keywords: ["scooter", "vespa", "moped"] },
      { char: "🏍️", name: "motorcycle", keywords: ["motorcycle", "bike", "racing"] },
      { char: "🚲", name: "bicycle", keywords: ["bike", "bicycle", "cycle"] },
      { char: "🛴", name: "kick scooter", keywords: ["scooter", "kick", "ride"] },
      { char: "🛹", name: "skateboard", keywords: ["skateboard", "board", "skate"] },
      { char: "🚨", name: "police car light", keywords: ["siren", "police", "alarm", "emergency"] },
      { char: "🚥", name: "horizontal traffic light", keywords: ["traffic", "light", "stop"] },
      { char: "🚦", name: "vertical traffic light", keywords: ["traffic", "light", "stop"] },
      { char: "🛑", name: "stop sign", keywords: ["stop", "sign", "halt"] },
      { char: "⚓", name: "anchor", keywords: ["anchor", "boat", "ship", "navy"] },
      { char: "⛵", name: "sailboat", keywords: ["sailboat", "boat", "yacht", "sea"] },
      { char: "🚤", name: "speedboat", keywords: ["speedboat", "boat", "fast", "ocean"] },
      { char: "🛳️", name: "passenger ship", keywords: ["ship", "cruise", "boat"] },
      { char: "🚢", name: "ship", keywords: ["ship", "cargo", "boat", "ocean"] },
      { char: "✈️", name: "airplane", keywords: ["airplane", "plane", "flight", "fly"] },
      { char: "🛫", name: "airplane departure", keywords: ["takeoff", "plane", "departure", "travel"] },
      { char: "🛬", name: "airplane arrival", keywords: ["landing", "plane", "arrival", "travel"] },
      { char: "🪂", name: "parachute", keywords: ["parachute", "skydiving", "skydive"] },
      { char: "Helicopter", name: "helicopter", keywords: ["chopper", "helicopter", "fly"] },
      { char: "🛸", name: "flying saucer", keywords: ["ufo", "alien", "space"] },
      { char: "🛎️", name: "bellhop bell", keywords: ["bell", "hotel", "service"] },
      { char: "🧳", name: "luggage", keywords: ["luggage", "suitcase", "travel", "bag"] },
      { char: "⚽", name: "soccer ball", keywords: ["soccer", "football", "ball", "sports"] },
      { char: "🏀", name: "basketball", keywords: ["basketball", "ball", "sports"] },
      { char: "🏈", name: "american football", keywords: ["football", "ball", "sports"] },
      { char: "⚾", name: "baseball", keywords: ["baseball", "ball", "sports"] },
      { char: "🥎", name: "softball", keywords: ["softball", "ball", "sports"] },
      { char: "🎾", name: "tennis", keywords: ["tennis", "racket", "ball", "sports"] },
      { char: "🎱", name: "pool 8 ball", keywords: ["pool", "billiards", "8ball", "game"] },
      { char: "🏓", name: "ping pong", keywords: ["pingpong", "tabletennis", "paddle", "game"] },
      { char: "🏸", name: "badminton", keywords: ["badminton", "racket", "shuttlecock"] },
      { char: "🏒", name: "ice hockey", keywords: ["hockey", "ice", "puck"] },
      { char: "🏑", name: "field hockey", keywords: ["hockey", "field", "stick"] },
      { char: "🏏", name: "cricket game", keywords: ["cricket", "bat", "ball"] },
      { char: "⛳", name: "flag in hole", keywords: ["golf", "flag", "green", "sports"] },
      { char: "🏹", name: "bow and arrow", keywords: ["bow", "arrow", "archery"] },
      { char: "🎣", name: "fishing pole", keywords: ["fish", "fishing", "pole"] },
      { char: "🤿", name: "diving mask", keywords: ["diving", "snorkel", "swim", "ocean"] },
      { char: "🥊", name: "boxing glove", keywords: ["boxing", "glove", "fight"] },
      { char: "🥋", name: "martial arts uniform", keywords: ["karate", "taekwondo", "judo"] },
      { char: "🏆", name: "trophy", keywords: ["trophy", "winner", "prize", "first"] },
      { char: "🥇", name: "1st place medal", keywords: ["gold", "medal", "winner", "first"] },
      { char: "🥈", name: "2nd place medal", keywords: ["silver", "medal", "second"] },
      { char: "🥉", name: "3rd place medal", keywords: ["bronze", "medal", "third"] },
      { char: "🏅", name: "sports medal", keywords: ["medal", "award", "prize"] },
      { char: "🎖️", name: "military medal", keywords: ["medal", "military", "honor"] },
      { char: "🎫", name: "ticket", keywords: ["ticket", "admission", "show"] },
      { char: "🎟️", name: "admission tickets", keywords: ["tickets", "show", "movie"] },
      { char: "🎭", name: "performing arts", keywords: ["theater", "drama", "masks", "acting"] },
      { char: "🎨", name: "artist palette", keywords: ["paint", "art", "artist", "palette"] },
      { char: "🎬", name: "clapper board", keywords: ["movie", "clapper", "film", "director"] },
      { char: "🎤", name: "microphone", keywords: ["sing", "mic", "karaoke", "audio"] },
      { char: "🎧", name: "headphone", keywords: ["music", "headphones", "audio", "listen"] },
      { char: "🎼", name: "musical score", keywords: ["music", "score", "notes"] },
      { char: "🎹", name: "musical keyboard", keywords: ["piano", "keyboard", "music"] },
      { char: "🥁", name: "drum", keywords: ["drum", "music", "beat"] },
      { char: "🎷", name: "saxophone", keywords: ["sax", "saxophone", "music", "jazz"] },
      { char: "🎺", name: "trumpet", keywords: ["trumpet", "music", "brass"] },
      { char: "🎸", name: "guitar", keywords: ["guitar", "music", "string"] },
      { char: "🎻", name: "violin", keywords: ["violin", "music", "string"] },
      { char: "🎲", name: "game die", keywords: ["dice", "game", "roll", "random"] },
      { char: "🎯", name: "bullseye", keywords: ["target", "bullseye", "dart", "aim"] },
      { char: "🎳", name: "bowling", keywords: ["bowling", "pins", "ball"] },
      { char: "🎮", name: "video game", keywords: ["game", "controller", "playstation", "xbox"] },
      { char: "🎰", name: "slot machine", keywords: ["slot", "machine", "casino", "gamble"] },
      { char: "🧩", name: "puzzle piece", keywords: ["puzzle", "piece", "jigsaw"] }
    ]
  },
  {
    name: "Objects",
    icon: "💡",
    emojis: [
      { char: "⌚", name: "watch", keywords: ["watch", "time", "clock"] },
      { char: "📱", name: "mobile phone", keywords: ["phone", "mobile", "cell"] },
      { char: "💻", name: "laptop", keywords: ["laptop", "computer", "pc", "tech"] },
      { char: "⌨️", name: "keyboard", keywords: ["keyboard", "computer", "type"] },
      { char: "🖥️", name: "desktop computer", keywords: ["computer", "desktop", "monitor"] },
      { char: "🖨️", name: "printer", keywords: ["printer", "paper", "print"] },
      { char: "🖱️", name: "computer mouse", keywords: ["mouse", "computer", "click"] },
      { char: "📷", name: "camera", keywords: ["camera", "photo", "shoot"] },
      { char: "📸", name: "camera with flash", keywords: ["camera", "flash", "photo"] },
      { char: "📞", name: "telephone receiver", keywords: ["phone", "call", "telephone"] },
      { char: "☎️", name: "telephone", keywords: ["phone", "call", "landline"] },
      { char: "📟", name: "pager", keywords: ["pager", "beeper", "retro"] },
      { char: "📠", name: "fax machine", keywords: ["fax", "machine", "retro"] },
      { char: "📺", name: "television", keywords: ["tv", "television", "screen"] },
      { char: "📻", name: "radio", keywords: ["radio", "music", "broadcast"] },
      { char: "🎙️", name: "studio microphone", keywords: ["mic", "podcast", "radio"] },
      { char: "🧭", name: "compass", keywords: ["compass", "directions", "north", "lost"] },
      { char: "⏱️", name: "stopwatch", keywords: ["timer", "stopwatch", "time"] },
      { char: "⏰", name: "alarm clock", keywords: ["clock", "alarm", "time", "wake"] },
      { char: "⏳", name: "hourglass hourglass flowing sand", keywords: ["timer", "hourglass", "time"] },
      { char: "💡", name: "light bulb", keywords: ["idea", "bulb", "light", "smart"] },
      { char: "🔦", name: "flashlight", keywords: ["flashlight", "light", "torch"] },
      { char: "🕯️", name: "candle", keywords: ["candle", "light", "wax"] },
      { char: "💸", name: "money with wings", keywords: ["money", "wings", "spend", "rich"] },
      { char: "💵", name: "dollar banknote", keywords: ["money", "dollar", "cash", "green"] },
      { char: "🪙", name: "coin", keywords: ["coin", "money", "gold", "silver"] },
      { char: "💰", name: "money bag", keywords: ["money", "bag", "rich", "cash"] },
      { char: "💳", name: "credit card", keywords: ["card", "credit", "money", "pay"] },
      { char: "💎", name: "gem stone", keywords: ["diamond", "gem", "jewel", "rich"] },
      { char: "⚖️", name: "balance scale", keywords: ["scale", "justice", "law", "court"] },
      { char: "🧰", name: "toolbox", keywords: ["toolbox", "tools", "repair"] },
      { char: "🔧", name: "wrench", keywords: ["wrench", "tool", "repair", "fix"] },
      { char: "🔨", name: "hammer", keywords: ["hammer", "tool", "repair", "build"] },
      { char: "⚒️", name: "hammer and pick", keywords: ["hammer", "pick", "tools", "mine"] },
      { char: "🔩", name: "nut and bolt", keywords: ["screw", "bolt", "nut", "hardware"] },
      { char: "⚙️", name: "gear", keywords: ["gear", "cog", "cogwheel", "process"] },
      { char: "🧱", name: "brick", keywords: ["brick", "wall", "build"] },
      { char: "⛓️", name: "chains", keywords: ["chain", "link", "locked"] },
      { char: "🔫", name: "water pistol", keywords: ["gun", "pistol", "water", "toy"] },
      { char: "💣", name: "bomb", keywords: ["bomb", "explode", "danger"] },
      { char: "🧨", name: "firecracker", keywords: ["firecracker", "explode", "celebrate"] },
      { char: "🔪", name: "kitchen knife", keywords: ["knife", "cut", "kitchen", "cook"] },
      { char: "🗡️", name: "dagger", keywords: ["dagger", "sword", "weapon"] },
      { char: "⚔️", name: "crossed swords", keywords: ["swords", "fight", "battle"] },
      { char: "🛡️", name: "shield", keywords: ["shield", "protect", "defense"] },
      { char: "🚬", name: "cigarette", keywords: ["smoke", "cigarette", "tobacco"] },
      { char: "🔮", name: "crystal ball", keywords: ["crystal", "fortune", "magic"] },
      { char: "🧿", name: "nazar amulet", keywords: ["evil-eye", "amulet", "protection"] },
      { char: "💈", name: "barber pole", keywords: ["barber", "haircut", "pole"] },
      { char: "🧲", name: "magnet", keywords: ["magnet", "attract", "metal"] },
      { char: "🧪", name: "test tube", keywords: ["chemistry", "science", "lab", "experiment"] },
      { char: "🔬", name: "microscope", keywords: ["science", "lab", "microscope", "magnify"] },
      { char: "🔭", name: "telescope", keywords: ["space", "stars", "telescope"] },
      { char: "📡", name: "satellite antenna", keywords: ["satellite", "dish", "signal"] },
      { char: "💉", name: "syringe", keywords: ["syringe", "shot", "vaccine", "needle"] },
      { char: "💊", name: "pill", keywords: ["pill", "drug", "medicine", "sick"] },
      { char: "🩹", name: "adhesive bandage", keywords: ["bandage", "bandaid", "hurt"] },
      { char: "🩺", name: "stethoscope", keywords: ["doctor", "stethoscope", "heart", "health"] },
      { char: "🚪", name: "door", keywords: ["door", "room", "entrance"] },
      { char: "🛏️", name: "bed", keywords: ["bed", "sleep", "hotel"] },
      { char: "🛋️", name: "couch and lamp", keywords: ["couch", "sofa", "livingroom"] },
      { char: "🪑", name: "chair", keywords: ["chair", "seat", "sit"] },
      { char: "🚽", name: "toilet", keywords: ["toilet", "bathroom", "loo"] },
      { char: "🚿", name: "shower", keywords: ["shower", "wash", "bathroom"] },
      { char: "🛁", name: "bathtub", keywords: ["bath", "tub", "wash"] },
      { char: "🔑", name: "key", keywords: ["key", "unlock", "lock", "access"] },
      { char: "🗝️", name: "old key", keywords: ["key", "old", "secret"] },
      { char: "🔐", name: "locked with key", keywords: ["lock", "key", "secure"] },
      { char: "🔒", name: "locked", keywords: ["lock", "secure", "closed"] },
      { char: "🔓", name: "unlocked", keywords: ["lock", "open", "free"] },
      { char: "❤️", name: "red heart", keywords: ["love", "heart", "red"] },
      { char: "🧡", name: "orange heart", keywords: ["love", "heart", "orange"] },
      { char: "💛", name: "yellow heart", keywords: ["love", "heart", "yellow"] },
      { char: "💚", name: "green heart", keywords: ["love", "heart", "green"] },
      { char: "💙", name: "blue heart", keywords: ["love", "heart", "blue"] },
      { char: "💜", name: "purple heart", keywords: ["love", "heart", "purple"] },
      { char: "🖤", name: "black heart", keywords: ["love", "heart", "black"] },
      { char: "🤍", name: "white heart", keywords: ["love", "heart", "white"] },
      { char: "🤎", name: "brown heart", keywords: ["love", "heart", "brown"] },
      { char: "💔", name: "broken heart", keywords: ["love", "broken", "heart", "sad"] },
      { char: "❣️", name: "heart exclamation", keywords: ["love", "exclamation", "heart"] },
      { char: "💕", name: "two hearts", keywords: ["love", "hearts", "affection"] },
      { char: "💞", name: "revolving hearts", keywords: ["love", "hearts", "spin"] },
      { char: "💓", name: "beating heart", keywords: ["love", "heart", "pulse"] },
      { char: "💗", name: "growing heart", keywords: ["love", "heart", "grow"] },
      { char: "💖", name: "sparkling heart", keywords: ["love", "heart", "sparkle"] },
      { char: "💘", name: "heart with arrow", keywords: ["love", "cupid", "arrow"] },
      { char: "💝", name: "heart with ribbon", keywords: ["love", "gift", "ribbon"] },
      { char: "💟", name: "heart decoration", keywords: ["love", "heart", "frame"] },
      { char: "🔥", name: "fire", keywords: ["fire", "hot", "flame", "lit"] },
      { char: "✨", name: "sparkles", keywords: ["sparkle", "stars", "magic", "shiny"] },
      { char: "🌟", name: "glowing star", keywords: ["star", "gold", "shine"] },
      { char: "⭐", name: "star", keywords: ["star", "gold"] },
      { char: "🎉", name: "party popper", keywords: ["party", "celebrate", "congrats", "popper"] },
      { char: "🚀", name: "rocket", keywords: ["rocket", "space", "launch", "fast"] },
      { char: "💡", name: "light bulb", keywords: ["idea", "bulb", "light", "smart"] },
      { char: "💯", name: "hundred points", keywords: ["100", "perfect", "good", "grade"] }
    ]
  }
];

export default function GlobalChat({ currentUser, height = "100%", onClose, onMessagesCountChange }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const isNearBottomRef = useRef(true);

  const [isScrolling, setIsScrolling] = useState(false);
  const [floatingDate, setFloatingDate] = useState("");
  const scrollTimeoutRef = useRef<any>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<any>(null);

  const [lastReadId, setLastReadId] = useState<number>(() => {
    if (!currentUser) return 0;
    return parseInt(localStorage.getItem(`last_read_message_id_${currentUser.id}`) || "0");
  });
  const unreadRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mentions & Tagging States
  const [companyMembers, setCompanyMembers] = useState<{ id: number; name: string; role: string; email: string; }[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagStartIndex, setTagStartIndex] = useState(-1);
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);
  const highlightedRef = useRef<Record<number, boolean>>({});

  // Reactions and Replies States
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [reactionModalMsg, setReactionModalMsg] = useState<ChatMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: number; senderName: string; message: string } | null>(null);

  // Message Details and Selection States
  const [detailsModalMsg, setDetailsModalMsg] = useState<{ id: number; message: string; seen: any[]; delivered: any[]; undelivered: any[] } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("Smileys");
  const [emojiSearchQuery, setEmojiSearchQuery] = useState("");

  // Click Outside Message Dropdown Handler
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".msg-dropdown-trigger") && 
        !target.closest(".msg-dropdown-menu") && 
        activeMenuId !== null
      ) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [activeMenuId]);

  // Click Outside Emoji Picker Handler
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".emoji-picker-popup") && 
        !target.closest(".emoji-picker-trigger") && 
        showEmojiPicker
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showEmojiPicker]);

  // Auto-grow textarea height dynamic handling
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleReact = async (msgId: number, emoji: string) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`/api/chat/${msgId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return { ...m, reactions: JSON.stringify(data.reactions) };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  const handleOpenDetails = async (msg: ChatMessage) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`/api/chat/${msg.id}/status`);
      if (res.ok) {
        const data = await res.json();
        setDetailsModalMsg({
          id: msg.id,
          message: msg.message,
          seen: data.seen || [],
          delivered: data.delivered || [],
          undelivered: data.undelivered || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch message details status:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    try {
      const res = await fetch("/api/chat/delete-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: selectedMessageIds })
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        setIsSelectionMode(false);
        setSelectedMessageIds([]);
        fetchMessages(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete messages");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError("Network error when deleting messages.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleScrollToParent = (parentId: number | undefined) => {
    if (!parentId) return;
    const parentElement = chatContainerRef.current?.querySelector(`[data-message-id="${parentId}"]`);
    if (parentElement) {
      isProgrammaticScrollRef.current = true;
      parentElement.scrollIntoView({ behavior: "smooth", block: "center" });
      
      setActiveHighlightId(parentId);
      setTimeout(() => {
        setActiveHighlightId(null);
      }, 2000);
      
      if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1000);
    } else {
      setError("Parent message was deleted or is too old.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const companyId = currentUser?.companyId;

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setError(null);
        if (data.length > 0 && currentUser) {
          const highestId = Math.max(...data.map((m: any) => m.id));
          const lastReadIdVal = parseInt(localStorage.getItem(`last_read_message_id_${currentUser.id}`) || "0");
          if (highestId > lastReadIdVal) {
            setLastReadId(highestId);
            try {
              localStorage.setItem(`last_read_message_id_${currentUser.id}`, String(highestId));
            } catch (e) {
              console.error("Failed to save last read message id to localStorage:", e);
            }
            fetch("/api/chat/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lastMessageId: highestId })
            }).catch(err => console.error("Error updating read status on server:", err));
          }
        }
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to load messages");
      }
    } catch (err: any) {
      setError("Server connection issue. Offline.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    await fetchMessages(true);
    const elapsed = Date.now() - startTime;
    const minTime = 800; // spin for at least 800ms for premium feel
    if (elapsed < minTime) {
      setTimeout(() => {
        setIsRefreshing(false);
      }, minTime - elapsed);
    } else {
      setIsRefreshing(false);
    }
  };

  // Load Company Members on Mount for Tagging
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/chat/company-members");
        if (res.ok) {
          const data = await res.json();
          // Filter out the current user themselves
          setCompanyMembers(data.filter((m: any) => m.id !== currentUser?.id));
        }
      } catch (err) {
        console.error("Failed to load company members for tagging:", err);
      }
    };
    if (currentUser) {
      fetchMembers();
    }
  }, [currentUser]);

  // Click Outside Tag Dropdown Handler
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".tag-dropdown-wrapper") && !target.closest("#composer-input-field")) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  // Viewport highlight observer for mentioned unread messages
  useEffect(() => {
    if (loading || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const msgId = parseInt(entry.target.getAttribute("data-mention-msg-id") || "0");
            if (msgId && !highlightedRef.current[msgId]) {
              highlightedRef.current[msgId] = true;
              setActiveHighlightId(msgId);
              setTimeout(() => {
                setActiveHighlightId(null);
              }, 2500);
            }
          }
        });
      },
      {
        root: chatContainerRef.current,
        threshold: 0.3 // Trigger when 30% of message is visible
      }
    );

    const elements = chatContainerRef.current?.querySelectorAll("[data-mention-msg-id]");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, loading]);

  // Poll for new messages every 4 seconds
  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (programmaticScrollTimeoutRef.current) {
        clearTimeout(programmaticScrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages list changes (only if user is near bottom and initial scroll has already happened)
  useEffect(() => {
    if (isNearBottomRef.current && hasInitialScrolled.current) {
      isProgrammaticScrollRef.current = true;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1000);

      // Mark incoming messages as read since user is at the bottom
      if (messages.length > 0 && currentUser) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.id > lastReadId) {
          setLastReadId(lastMsg.id);
          try {
            localStorage.setItem(`last_read_message_id_${currentUser.id}`, String(lastMsg.id));
          } catch (e) {
            console.error("Failed to save last read message id to localStorage:", e);
          }
          fetch("/api/chat/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastMessageId: lastMsg.id })
          }).catch(err => console.error("Error updating read status on server:", err));
        }
      }
    }
  }, [messages, currentUser]);

  // Initial scroll positioning (auto-scrolls to unread divider on mount if unreads exist)
  useEffect(() => {
    if (!loading && messages.length > 0 && !hasInitialScrolled.current) {
      hasInitialScrolled.current = true;

      // Find if we have unread messages in the feed
      const hasUnread = messages.some(m => m.senderId !== currentUser?.id && m.id > lastReadId);

      if (hasUnread) {
        let retries = 0;
        const tryScroll = () => {
          const container = chatContainerRef.current;
          const element = unreadRef.current;
          if (element && container) {
            isNearBottomRef.current = false;
            isProgrammaticScrollRef.current = true;
            element.scrollIntoView({ behavior: "auto", block: "center" });
            if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
            programmaticScrollTimeoutRef.current = setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 300);
          } else if (retries < 30) {
            retries++;
            setTimeout(tryScroll, 50);
          }
        };
        setTimeout(tryScroll, 50);
      } else {
        isNearBottomRef.current = true;
        isProgrammaticScrollRef.current = true;
        const tryScrollBottom = () => {
          const container = chatContainerRef.current;
          if (container) {
            container.scrollTop = container.scrollHeight;
            if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
            programmaticScrollTimeoutRef.current = setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 300);
          }
        };
        setTimeout(tryScrollBottom, 50);
      }
    }
  }, [loading, messages, currentUser]);

  // Notify parent of message count and mention count changes
  useEffect(() => {
    if (onMessagesCountChange && currentUser) {
      const lastRead = parseInt(localStorage.getItem(`last_read_message_id_${currentUser.id}`) || "0");
      const unreadMessages = messages.filter(m => m.senderId !== currentUser.id && m.id > lastRead);
      const unreadCount = unreadMessages.length;
      
      const nameTag = `@${currentUser.name.toLowerCase()}`;
      const emailTag = currentUser.email ? `@${currentUser.email.toLowerCase()}` : "";
      let mentionCount = 0;
      unreadMessages.forEach(m => {
        const content = m.message.toLowerCase();
        let isReplyToMe = false;
        if (m.replyToMessage) {
          try {
            const parent = JSON.parse(m.replyToMessage);
            if (parent.senderId === currentUser.id || parent.senderName === currentUser.name) {
              isReplyToMe = true;
            }
          } catch (e) {}
        }
        if (content.includes(nameTag) || (emailTag && content.includes(emailTag)) || content.includes("@all") || isReplyToMe) {
          mentionCount++;
        }
      });
      onMessagesCountChange(unreadCount, mentionCount);
    }
  }, [messages, lastReadId, onMessagesCountChange, currentUser]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // 1. Check if scrolled near bottom (within 100px)
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight <= 100;
    
    isNearBottomRef.current = isNearBottom;

    // Show Scroll to bottom button if more than 300px from bottom
    setShowScrollBottomBtn(
      container.scrollHeight - container.scrollTop - container.clientHeight > 300
    );

    // If user manually scrolls to bottom, mark all messages as read
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 50;
    if (isAtBottom && messages.length > 0 && !isProgrammaticScrollRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (currentUser && lastMsg.id > lastReadId) {
        setLastReadId(lastMsg.id);
        try {
          localStorage.setItem(`last_read_message_id_${currentUser.id}`, String(lastMsg.id));
        } catch (e) {
          console.error("Failed to save last read message id to localStorage:", e);
        }
        fetch("/api/chat/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastMessageId: lastMsg.id })
        }).catch(err => console.error("Error updating read status on server:", err));
      }
    }

    // 2. Active date calculations for floating header
    const containerTop = container.getBoundingClientRect().top;
    const elements = container.querySelectorAll("[data-date-str]");
    let activeDate = "";
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      // Check if element is at or past the top boundary
      if (rect.top - containerTop >= -20) {
        activeDate = el.dataset.dateStr || "";
        break;
      }
    }
    
    if (activeDate) {
      setFloatingDate(activeDate);
    }

    // 3. Scroll timer logic (reveal floating bubble, fade out after 1.5s of no scroll)
    if (!isProgrammaticScrollRef.current) {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: newMessage.trim(),
          replyToId: replyingTo ? replyingTo.id : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setNewMessage("");
        setReplyingTo(null);
        setError(null);
        // Force scroll to bottom for self messages
        isNearBottomRef.current = true;
        isProgrammaticScrollRef.current = true;
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
          programmaticScrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 1000);
        }, 50);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to send message");
      }
    } catch (err) {
      setError("Could not submit message. Please retry.");
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const selectionStart = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, selectionStart);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // Ensure there's no space in the query, meaning they are still typing a username
      if (!textAfterAt.includes(" ")) {
        setShowTagDropdown(true);
        setTagSearchQuery(textAfterAt);
        setTagStartIndex(atIndex);
        return;
      }
    }
    setShowTagDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sending) {
        const fakeEvent = {
          preventDefault: () => {}
        } as React.FormEvent;
        handleSendMessage(fakeEvent);
      }
    }
  };

  const handleSelectMember = (name: string) => {
    if (tagStartIndex !== -1) {
      const val = newMessage;
      const before = val.slice(0, tagStartIndex);
      // selectionStart check for text after tag
      const selectionStart = inputRef.current?.selectionStart || 0;
      const after = val.slice(selectionStart);
      const newVal = `${before}@${name} ${after}`;
      setNewMessage(newVal);
      setShowTagDropdown(false);
      setTagStartIndex(-1);
      
      // Refocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter((msg) =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.senderRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case "boss":
        return {
          border: "1px solid rgba(234, 179, 8, 0.4)",
          background: "linear-gradient(135deg, #fef08a 0%, #fef9c3 100%)",
          color: "#854d0e",
          label: "👑 Boss"
        };
      case "manager":
        return {
          border: "1px solid rgba(59, 130, 246, 0.4)",
          background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
          color: "#1e40af",
          label: "💼 Manager"
        };
      case "tl":
        return {
          border: "1px solid rgba(249, 115, 22, 0.4)",
          background: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)",
          color: "#9a3412",
          label: "⚡ Team Lead"
        };
      case "recruiter":
        return {
          border: "1px solid rgba(16, 185, 129, 0.4)",
          background: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
          color: "#065f46",
          label: "👤 Recruiter"
        };
      default:
        return {
          border: "1px solid #cbd5e1",
          background: "#f1f5f9",
          color: "#475569",
          label: role.toUpperCase()
        };
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const getMessageDateHeader = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const dYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

      if (dDate === dToday) {
        return "Today";
      } else if (dDate === dYesterday) {
        return "Yesterday";
      } else if (dToday - dDate < 7 * 24 * 60 * 60 * 1000) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekdays[date.getDay()];
      } else {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    } catch (e) {
      return "";
    }
  };

  // Tag dropdown members filtering
  const filteredMembers = companyMembers.filter(m =>
    m.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(tagSearchQuery.toLowerCase()))
  );

  // Find first unread message in filteredMessages
  const firstUnreadMsg = filteredMessages.find(
    (m) => m.senderId !== currentUser?.id && m.id > lastReadId
  );

  const unreadCountForFeed = filteredMessages.filter(
    (m) => m.senderId !== currentUser?.id && m.id > lastReadId
  ).length;
 
  const getFilteredEmojis = () => {
    if (!emojiSearchQuery) {
      const category = EMOJI_CATEGORIES.find(c => c.name === selectedEmojiCategory);
      return category ? category.emojis : [];
    }
    
    const query = emojiSearchQuery.toLowerCase();
    const results: { char: string; name: string; keywords: string[] }[] = [];
    
    for (const category of EMOJI_CATEGORIES) {
      for (const emoji of category.emojis) {
        if (
          emoji.name.toLowerCase().includes(query) ||
          emoji.keywords.some(k => k.toLowerCase().includes(query))
        ) {
          if (!results.some(r => r.char === emoji.char)) {
            results.push(emoji);
          }
        }
      }
    }
    return results;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: height,
      background: "#ffffff",
      borderRadius: "24px",
      border: "1.5px solid #e2e8f0",
      boxShadow: "0 10px 25px -15px rgba(0,0,0,0.05)",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Chat Header */}
      <div style={{
        padding: "10px 14px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderBottom: "1.5px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        {/* Row 1: Title and Actions */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              background: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <LucideMessageSquare size={14} />
            </div>
            <div>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 950, color: "#0f172a", margin: 0, letterSpacing: "-0.2px", lineHeight: "1.2" }}>
                Global Corporate Chat
              </h2>
              <p style={{ fontSize: "0.6rem", color: "#64748b", margin: "2px 0 0", fontWeight: 700 }}>
                Company-wide secure messaging channel
              </p>
            </div>
          </div>

          {/* Window action controls (sync, close) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              onClick={handleManualRefresh}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#cbd5e1",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                outline: "none"
              }}
            >
              <motion.div
                animate={isRefreshing || loading ? { rotate: 360 } : { rotate: 0 }}
                transition={isRefreshing || loading ? {
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear"
                } : { duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <LucideRefreshCw size={12} />
              </motion.div>
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#cbd5e1",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}
              >
                <LucideX size={12} />
              </button>
            )}
          </div>
        </div>

         {/* Row 2: Search box / Selection Actions */}
        {isSelectionMode ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff1f2",
            border: "1.5px solid #fca5a5",
            borderRadius: "8px",
            padding: "4px 10px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#991b1b" }}>
                {selectedMessageIds.length} message(s) selected
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedMessageIds.length === 0}
                style={{
                  background: selectedMessageIds.length === 0 ? "#cbd5e1" : "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  cursor: selectedMessageIds.length === 0 ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedMessageIds([]);
                }}
                style={{
                  background: "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "4px 8px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
          }}>
            <LucideSearch size={12} color="#94a3b8" style={{ marginRight: "6px" }} />
            <input 
              type="text" 
              placeholder="Search chat history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "0.7rem",
                width: "100%",
                color: "#1e293b"
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Scroll Date Header (Light Blue Glassmorphism) */}
      <AnimatePresence>
        {isScrolling && floatingDate && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "124px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              pointerEvents: "none"
            }}
          >
            <span style={{
              background: "rgba(224, 242, 254, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#0369a1",
              fontSize: "0.72rem",
              fontWeight: 900,
              padding: "6px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(186, 230, 253, 0.7)",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.05)",
              letterSpacing: "0.3px"
            }}>
              {floatingDate}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Pane */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          padding: "16px 20px",
          overflowY: "auto",
          background: "#fafbfc",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            color: "#b91c1c",
            padding: "10px 16px",
            fontSize: "0.8rem",
            fontWeight: 800,
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#64748b"
          }}>
            <LucideRefreshCw size={24} className="animate-spin" style={{ color: "#2563eb", marginBottom: "8px" }} />
            <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>Syncing team transmissions...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#94a3b8"
          }}>
            <LucideMessageSquare size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
            <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>
              {searchQuery ? "No messages matching your search." : "No messages. Start the conversation!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.flatMap((msg, index) => {
              const isSelf = msg.senderId === currentUser?.id;
              const badge = getRoleBadgeStyle(msg.senderRole);
              
              // Date group header logic
              const showDateHeader = index === 0 || (() => {
                const prevMsg = filteredMessages[index - 1];
                const prevDate = new Date(prevMsg.createdAt).toLocaleDateString();
                const currDate = new Date(msg.createdAt).toLocaleDateString();
                return prevDate !== currDate;
              })();

              const dateHeader = showDateHeader ? getMessageDateHeader(msg.createdAt) : null;
              
              const elements = [];

              if (firstUnreadMsg && msg.id === firstUnreadMsg.id) {
                elements.push(
                  <div 
                    ref={unreadRef}
                    key="unread-messages-divider"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "16px 0 8px",
                      width: "100%",
                    }}
                  >
                    <span style={{
                      background: "rgba(254, 242, 254, 0.85)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      color: "#ef4444",
                      fontSize: "0.72rem",
                      fontWeight: 900,
                      padding: "4px 14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(254, 202, 202, 0.8)",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.05)",
                      letterSpacing: "0.3px"
                    }}>
                      {unreadCountForFeed} Unread Messages
                    </span>
                  </div>
                );
              }

              if (dateHeader) {
                elements.push(
                  <div 
                    key={`date-${msg.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "16px 0 8px",
                      width: "100%",
                    }}
                  >
                    <span style={{
                      background: "rgba(224, 242, 254, 0.6)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      color: "#0369a1",
                      fontSize: "0.72rem",
                      fontWeight: 900,
                      padding: "4px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(186, 230, 253, 0.6)",
                      boxShadow: "0 2px 8px rgba(14, 165, 233, 0.05)",
                      letterSpacing: "0.3px"
                    }}>
                      {dateHeader}
                    </span>
                  </div>
                );
              }

              const nameTag = `@${currentUser?.name.toLowerCase()}`;
              const emailTag = currentUser?.email ? `@${currentUser.email.toLowerCase()}` : "";
              
              let isReplyToMe = false;
              if (msg.replyToMessage && currentUser) {
                try {
                  const parent = JSON.parse(msg.replyToMessage);
                  if (parent.senderId === currentUser.id || parent.senderName === currentUser.name) {
                    isReplyToMe = true;
                  }
                } catch (e) {}
              }

              const isCurrentUserMentioned = !isSelf && currentUser && (
                msg.message.toLowerCase().includes(nameTag) ||
                (emailTag && msg.message.toLowerCase().includes(emailTag)) ||
                msg.message.toLowerCase().includes("@all") ||
                isReplyToMe
              );
              const isUnreadMention = isCurrentUserMentioned && msg.id > lastReadId;

              elements.push(
                <motion.div
                  key={msg.id}
                  data-message-id={msg.id}
                  data-date-str={getMessageDateHeader(msg.createdAt)}
                  data-mention-msg-id={isUnreadMention ? msg.id : undefined}
                  className={activeHighlightId === msg.id ? "mention-highlight" : ""}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isSelf ? "flex-end" : "flex-start",
                    width: "100%",
                    padding: activeHighlightId === msg.id ? "6px 8px" : undefined
                  }}
                >
                  {/* Sender Details */}
                  {!isSelf && (
                    <div style={{ 
                       display: "flex", 
                       alignItems: "center", 
                       gap: "6px", 
                       marginBottom: "4px",
                       marginLeft: "6px" 
                    }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 900, color: "#334155" }}>
                        {msg.senderName}
                      </span>
                      <span style={{
                        fontSize: "0.55rem",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "10px",
                        ...badge
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble wrapper */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                    maxWidth: "75%",
                    minWidth: 0,
                    opacity: isSelectionMode && (!isSelf || msg.isDeleted) ? 0.4 : 1,
                    pointerEvents: isSelectionMode && (!isSelf || msg.isDeleted) ? "none" : undefined
                  }}>
                    {/* Selection Checkbox */}
                    {isSelectionMode && isSelf && !msg.isDeleted && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          const isSelected = selectedMessageIds.includes(msg.id);
                          setSelectedMessageIds(prev => 
                            isSelected ? prev.filter(id => id !== msg.id) : [...prev, msg.id]
                          );
                        }}
                        style={{
                          cursor: "pointer",
                          marginRight: "8px",
                          alignSelf: "center",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: selectedMessageIds.includes(msg.id) ? "2px solid #ef4444" : "2px solid #cbd5e1",
                          background: selectedMessageIds.includes(msg.id) ? "#ef4444" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "bold",
                          flexShrink: 0
                        }}
                      >
                        {selectedMessageIds.includes(msg.id) && "✓"}
                      </div>
                    )}

                    {/* The message content card */}
                    <div 
                      onMouseEnter={() => !msg.isDeleted && setHoveredMessageId(msg.id)}
                      onMouseLeave={() => !msg.isDeleted && setHoveredMessageId(null)}
                      onClick={() => {
                        if (isSelectionMode && isSelf && !msg.isDeleted) {
                          const isSelected = selectedMessageIds.includes(msg.id);
                          setSelectedMessageIds(prev => 
                            isSelected ? prev.filter(id => id !== msg.id) : [...prev, msg.id]
                          );
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (!msg.isDeleted && !isSelectionMode) {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                        }
                      }}
                      style={{
                        background: msg.isDeleted
                          ? "rgba(241, 245, 249, 0.4)"
                          : (activeHighlightId === msg.id 
                              ? "rgba(245, 158, 11, 0.25)"
                              : (isCurrentUserMentioned 
                                  ? "rgba(245, 158, 11, 0.08)"
                                  : (isSelf ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#ffffff"))),
                        color: msg.isDeleted
                          ? "#94a3b8"
                          : (activeHighlightId === msg.id
                              ? "#1e293b"
                              : (isSelf 
                                  ? "#ffffff" 
                                  : (isCurrentUserMentioned ? "#78350f" : "#1e293b"))),
                        border: msg.isDeleted
                          ? "1.5px dashed #cbd5e1"
                          : (activeHighlightId === msg.id
                              ? "1.5px solid rgba(245, 158, 11, 0.6)"
                              : (isCurrentUserMentioned
                                  ? "1.5px solid rgba(245, 158, 11, 0.4)"
                                  : (isSelf ? "none" : "1.5px solid #e2e8f0"))),
                        borderRadius: isSelf ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        padding: "8px 12px",
                        paddingRight: msg.isDeleted ? "12px" : "28px",
                        boxShadow: msg.isDeleted
                          ? "none"
                          : (activeHighlightId === msg.id
                              ? "0 0 15px rgba(245, 158, 11, 0.3)"
                              : (isCurrentUserMentioned
                                  ? "0 2px 8px rgba(245, 158, 11, 0.08)"
                                  : (isSelf ? "0 4px 12px rgba(37,99,235,0.12)" : "0 2px 6px rgba(0,0,0,0.02)"))),
                        fontSize: "0.78rem",
                        fontWeight: isSelf ? 700 : (isCurrentUserMentioned ? 700 : 600),
                        lineHeight: "1.4",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        transition: "all 0.3s ease",
                        position: "relative",
                        cursor: isSelectionMode ? (isSelf && !msg.isDeleted ? "pointer" : "default") : "default",
                        minWidth: 0,
                        maxWidth: "100%"
                      }}
                    >
                      {/* Parent reply reference card (inside bubble) */}
                      {(() => {
                        if (msg.isDeleted || !msg.replyToMessage) return null;
                        let parent: { senderName: string; message: string } | null = null;
                        try {
                          parent = JSON.parse(msg.replyToMessage);
                        } catch(e) {}
                        if (!parent) return null;

                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScrollToParent(msg.replyToId);
                            }}
                            style={{
                              background: isSelf ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.04)",
                              borderLeft: isSelf ? "3.5px solid #fef08a" : "3.5px solid #eab308",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              marginBottom: "6px",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: "1px",
                              overflow: "hidden",
                              maxWidth: "100%",
                              width: "100%",
                              boxSizing: "border-box"
                            }}
                          >
                            <span style={{ 
                              fontSize: "0.62rem", 
                              fontWeight: 900, 
                              color: isSelf ? "#fef08a" : "#854d0e",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              width: "100%",
                              maxWidth: "100%"
                            }}>
                              {parent.senderName}
                            </span>
                            <span style={{ 
                              fontSize: "0.66rem", 
                              color: isSelf ? "rgba(255,255,255,0.9)" : "#475569",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              width: "100%",
                              maxWidth: "100%"
                            }}>
                              {parent.message}
                            </span>
                          </div>
                        );
                      })()}

                      {msg.isDeleted ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#94a3b8",
                          fontStyle: "italic",
                          fontWeight: 500,
                          fontSize: "0.75rem"
                        }}>
                          {/* Prohibition Icon */}
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                          </svg>
                          <span>This message was deleted</span>
                        </div>
                      ) : (
                        <div>{msg.message}</div>
                      )}

                      {/* Hover down arrow button */}
                      {(hoveredMessageId === msg.id || activeMenuId === msg.id) && !msg.isDeleted && !isSelectionMode && (
                        <button
                          type="button"
                          className="msg-dropdown-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                          }}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: isSelf ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                            border: "none",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: isSelf ? "#ffffff" : "#64748b",
                            padding: 0,
                            outline: "none"
                          }}
                        >
                          <LucideChevronDown size={10} />
                        </button>
                      )}

                      {/* Dropdown Menu overlay */}
                      {activeMenuId === msg.id && (
                        <div 
                          className="msg-dropdown-menu"
                          style={{
                            position: "absolute",
                            top: "24px",
                            right: isSelf ? "4px" : "auto",
                            left: isSelf ? "auto" : "4px",
                            zIndex: 200,
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            width: "200px"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Reactions Row */}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "2px 4px",
                            borderBottom: "1px solid #e2e8f0",
                            marginBottom: "4px"
                          }}>
                            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                              <span
                                key={emoji}
                                onClick={() => handleReact(msg.id, emoji)}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.95rem",
                                  padding: "2px",
                                  borderRadius: "4px",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>

                          {/* Reply Action */}
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo({ id: msg.id, senderName: msg.senderName, message: msg.message });
                              setActiveMenuId(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px 8px",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "#334155",
                              textAlign: "left",
                              cursor: "pointer",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            Reply
                          </button>

                          {/* Copy Action */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.message);
                              setActiveMenuId(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px 8px",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "#334155",
                              textAlign: "left",
                              cursor: "pointer",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            Copy
                          </button>

                          {isSelf && (
                            <>
                              {/* Details Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(msg)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: "4px 8px",
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#334155",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  borderRadius: "4px",
                                  width: "100%"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                Details
                              </button>

                              {/* Select Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSelectionMode(true);
                                  setSelectedMessageIds([msg.id]);
                                  setActiveMenuId(null);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: "4px 8px",
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#334155",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  borderRadius: "4px",
                                  width: "100%"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                Select
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reaction Badges below the message card */}
                  {(() => {
                    if (msg.isDeleted || !msg.reactions) return null;
                    let parsed: { userId: number; name: string; emoji: string }[] = [];
                    try {
                      parsed = JSON.parse(msg.reactions);
                    } catch(e) {
                      parsed = [];
                    }
                    if (!parsed || parsed.length === 0) return null;

                    const groups: Record<string, number> = {};
                    parsed.forEach(r => {
                      groups[r.emoji] = (groups[r.emoji] || 0) + 1;
                    });

                    return (
                      <div 
                        onClick={() => setReactionModalMsg(msg)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          marginTop: "2px",
                          marginBottom: "2px",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          padding: "2px 6px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          cursor: "pointer",
                          width: "fit-content",
                          alignSelf: isSelf ? "flex-end" : "flex-start",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#475569"
                        }}
                      >
                        {Object.entries(groups).map(([emoji, count]) => (
                          <span key={emoji}>{emoji} {count > 1 ? count : ""}</span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Message Timestamp */}
                  <span style={{
                    fontSize: "0.58rem",
                    color: "#94a3b8",
                    fontWeight: 700,
                    marginTop: "3px",
                    marginRight: isSelf ? "6px" : "0",
                    marginLeft: !isSelf ? "6px" : "0"
                  }}>
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </motion.div>
              );

              return elements;
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollBottomBtn && (
          <motion.button
            type="button"
            onClick={() => {
              isProgrammaticScrollRef.current = true;
              chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
              });
              isNearBottomRef.current = true;
              setShowScrollBottomBtn(false);
              if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
              programmaticScrollTimeoutRef.current = setTimeout(() => {
                isProgrammaticScrollRef.current = false;
              }, 1000);
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: "absolute",
              bottom: "86px",
              right: "32px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 50
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LucideArrowDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tag Dropdown Overlay */}
      {showTagDropdown && filteredMembers.length > 0 && (
        <div 
          className="tag-dropdown-wrapper"
          style={{
            position: "absolute",
            bottom: "74px",
            left: "24px",
            right: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1.5px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.08)",
            maxHeight: "180px",
            overflowY: "auto",
            zIndex: 1000,
            padding: "8px 0"
          }}
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => handleSelectMember(member.name)}
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#1e293b",
                transition: "background 0.2s",
                borderBottom: "1px solid #f1f5f9"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1e293b" }}>{member.name}</span>
              <span style={{
                fontSize: "0.62rem",
                background: "rgba(37, 99, 235, 0.06)",
                color: "#2563eb",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 800
              }}>
                {member.role.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reply target preview banner */}
      {replyingTo && (
        <div style={{
          padding: "6px 14px",
          background: "#f8fafc",
          borderTop: "1.5px solid #cbd5e1",
          borderLeft: "4px solid #eab308",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", width: "100%" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "#854d0e" }}>
              Replying to {replyingTo.senderName}
            </span>
            <span style={{ 
              fontSize: "0.7rem", 
              color: "#475569", 
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "90%"
            }}>
              {replyingTo.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0"
            }}
          >
            <LucideX size={10} />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div 
          className="emoji-picker-popup"
          style={{
            position: "absolute",
            bottom: "64px",
            right: "50px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1.5px solid #cbd5e1",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            padding: "12px",
            zIndex: 1000,
            width: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          {/* Categories / Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "8px"
          }}>
            {/* Search Input */}
            <div style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center"
            }}>
              <input 
                type="text"
                placeholder="Search emojis..."
                value={emojiSearchQuery}
                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  outline: "none",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  paddingRight: "24px",
                  fontSize: "0.7rem",
                  color: "#1e293b",
                  fontWeight: 600
                }}
              />
              {emojiSearchQuery && (
                <button
                  type="button"
                  onClick={() => setEmojiSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "6px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(false);
                setEmojiSearchQuery("");
              }}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                color: "#64748b",
                fontSize: "0.68rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            >
              ✕
            </button>
          </div>

          {/* Category Tabs Row */}
          {!emojiSearchQuery && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "4px",
              marginBottom: "4px"
            }}>
              {EMOJI_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedEmojiCategory(cat.name)}
                  title={cat.name}
                  style={{
                    background: selectedEmojiCategory === cat.name ? "rgba(37, 99, 235, 0.08)" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    transform: selectedEmojiCategory === cat.name ? "scale(1.1)" : "scale(1)"
                  }}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
          )}

          {/* Grid of emojis */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "6px",
            maxHeight: "180px",
            overflowY: "auto",
            paddingRight: "2px"
          }}>
            {getFilteredEmojis().map((emojiObj) => (
              <span
                key={emojiObj.char}
                onClick={() => {
                  setNewMessage(prev => prev + emojiObj.char);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 50);
                }}
                title={emojiObj.name}
                style={{
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  textAlign: "center",
                  padding: "4px",
                  borderRadius: "6px",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {emojiObj.char}
              </span>
            ))}
            {getFilteredEmojis().length === 0 && (
              <div style={{
                gridColumn: "span 8",
                textAlign: "center",
                padding: "20px 0",
                fontSize: "0.7rem",
                color: "#64748b",
                fontWeight: 600
              }}>
                No emojis found 😕
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Composer Area */}
      <form 
        onSubmit={handleSendMessage}
        style={{
          padding: "10px 16px",
          background: "#ffffff",
          borderTop: "1.5px solid #e2e8f0",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end"
        }}
      >
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flex: 1
        }}>
          <textarea 
            ref={inputRef}
            id="composer-input-field"
            placeholder={`Broadcast your thoughts to other company members...`}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={sending}
            rows={1}
            style={{
              width: "100%",
              outline: "none",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "0.76rem",
              color: "#1e293b",
              fontWeight: 600,
              transition: "all 0.2s ease",
              resize: "none",
              minHeight: "36px",
              maxHeight: "120px",
              fontFamily: "inherit",
              lineHeight: "1.4"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#cbd5e1";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="button"
          className="emoji-picker-trigger"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            background: "#f1f5f9",
            border: "1.5px solid #cbd5e1",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.1rem",
            outline: "none",
            transition: "all 0.2s ease",
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
        >
          😀
        </button>

        <motion.button 
          type="submit"
          disabled={!newMessage.trim() || sending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: !newMessage.trim() || sending 
              ? "#94a3b8" 
              : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !newMessage.trim() || sending ? "default" : "pointer",
            boxShadow: !newMessage.trim() || sending ? "none" : "0 4px 12px rgba(37,99,235,0.2)",
            transition: "background 0.2s ease",
            flexShrink: 0
          }}
        >
          <LucideSend size={14} />
        </motion.button>
      </form>

      {/* Reaction Details Modal */}
      {reactionModalMsg && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "280px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "10px 14px",
              background: "#f8fafc",
              borderBottom: "1px solid #cbd5e1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#0f172a" }}>Reactions</span>
              <button 
                type="button"
                onClick={() => setReactionModalMsg(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <LucideX size={12} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: "8px 12px",
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              {(() => {
                let reactionsList: { userId: number; name: string; emoji: string }[] = [];
                if (reactionModalMsg.reactions) {
                  try {
                    reactionsList = JSON.parse(reactionModalMsg.reactions);
                  } catch(e) {}
                }
                if (reactionsList.length === 0) {
                  return <div style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center", padding: "10px" }}>No reactions yet</div>;
                }
                return reactionsList.map((r, idx) => {
                  const isOwn = r.userId === currentUser?.id;
                  return (
                    <div 
                      key={idx}
                      onClick={isOwn ? () => {
                        handleReact(reactionModalMsg.id, r.emoji);
                        setReactionModalMsg(null);
                      } : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        background: isOwn ? "rgba(37, 99, 235, 0.05)" : "#f8fafc",
                        borderRadius: "8px",
                        border: isOwn ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid #e2e8f0",
                        cursor: isOwn ? "pointer" : "default"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.74rem", fontWeight: 800, color: isOwn ? "#2563eb" : "#1e293b" }}>
                          {isOwn ? "You" : r.name}
                        </span>
                        {isOwn && (
                          <span style={{ fontSize: "0.55rem", color: "#ef4444", fontWeight: 700 }}>
                            Click to remove
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "1.1rem" }}>{r.emoji}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Message Status Details Modal */}
      {detailsModalMsg && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "12px 14px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 950, color: "#0f172a" }}>Message Details</span>
              <button 
                type="button"
                onClick={() => setDetailsModalMsg(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <LucideX size={14} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: "14px",
              maxHeight: "340px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {/* Seen By Section */}
              <div>
                <h4 style={{ fontSize: "0.72rem", color: "#16a34a", margin: "0 0 6px 0", fontWeight: 900, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>✓✓ Seen By ({detailsModalMsg.seen.length})</span>
                </h4>
                {detailsModalMsg.seen.length === 0 ? (
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontStyle: "italic", paddingLeft: "4px" }}>No one has seen it yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {detailsModalMsg.seen.map((u, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", padding: "4px 8px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#166534" }}>{u.name}</span>
                        <span style={{ fontSize: "0.55rem", background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>{u.role.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivered To Section */}
              <div>
                <h4 style={{ fontSize: "0.72rem", color: "#2563eb", margin: "0 0 6px 0", fontWeight: 900, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>✓ Delivered To ({detailsModalMsg.delivered.length})</span>
                </h4>
                {detailsModalMsg.delivered.length === 0 ? (
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontStyle: "italic", paddingLeft: "4px" }}>No pending deliveries.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {detailsModalMsg.delivered.map((u, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", padding: "4px 8px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1e40af" }}>{u.name}</span>
                        <span style={{ fontSize: "0.55rem", background: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>{u.role.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Undelivered To Section */}
              <div>
                <h4 style={{ fontSize: "0.72rem", color: "#dc2626", margin: "0 0 6px 0", fontWeight: 900, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>✗ Undelivered To ({detailsModalMsg.undelivered.length})</span>
                </h4>
                {detailsModalMsg.undelivered.length === 0 ? (
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontStyle: "italic", paddingLeft: "4px" }}>No undelivered users.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {detailsModalMsg.undelivered.map((u, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", padding: "4px 8px", borderRadius: "6px", border: "1px solid #fecaca" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#991b1b" }}>{u.name}</span>
                        <span style={{ fontSize: "0.55rem", background: "#fee2e2", color: "#b91c1c", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>{u.role.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1.5px solid #fca5a5",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "280px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Modal Content */}
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
              <div style={{
                background: "#fee2e2",
                color: "#ef4444",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 950, color: "#0f172a", margin: 0 }}>
                Delete from Everyone?
              </h3>
              <p style={{ fontSize: "0.7rem", color: "#64748b", margin: 0, fontWeight: 600 }}>
                Are you sure you want to delete these {selectedMessageIds.length} message(s) for everyone? This action cannot be undone.
              </p>
            </div>

            {/* Modal Buttons */}
            <div style={{
              display: "flex",
              borderTop: "1px solid #fca5a5",
              background: "#fafafa"
            }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  padding: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#64748b",
                  cursor: "pointer",
                  borderRight: "1px solid #fca5a5"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  padding: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#ef4444",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
