export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  blurb: string;
  content: { heading?: string; text: string }[];
  image: string;
  date: string;
};

export const ARTICLES: Article[] = [
  {
    id: "j-1",
    slug: "choosing-right-colours",
    title: "How to Choose the Right Colours for Your Home",
    category: "DESIGN",
    blurb: "Learn how colour can change the mood, depth and character of a room.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200",
    date: "September 02, 2026",
    content: [
      { text: "Colour is the foundation of any interior. It dictates the mood the moment you walk through the door. Yet, choosing the right palette is often the most daunting part of designing a home." },
      { heading: "Understand the Light", text: "Before looking at paint swatches, look at your windows. The amount and direction of natural light in a room completely alters how a colour appears. North-facing rooms receive cool light and benefit from warm undertones. South-facing rooms are flooded with warm light and can handle cooler tones." },
      { heading: "The 60-30-10 Rule", text: "When building a palette, interior designers often rely on the 60-30-10 rule. 60% of the room should be your dominant colour, 30% should be the secondary colour, and 10% should be your accent colour." },
      { text: "To create flow throughout a house, carry one colour from room to room in different proportions. The accent colour in your living room could become the dominant wall colour in your dining room." }
    ]
  },
  {
    id: "j-2",
    slug: "making-small-room-feel-bigger",
    title: "Making a Small Room Feel Bigger",
    category: "SPACES",
    blurb: "Simple decisions around light, scale, and furniture placement can change a compact space.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    date: "August 28, 2026",
    content: [
      { text: "A small footprint does not have to mean a cramped lifestyle. With deliberate styling choices, even the most compact studio apartment can feel airy, generous, and carefully considered." },
      { heading: "Scale and Proportion", text: "A common mistake in small spaces is buying lots of small furniture. This actually makes the room look cluttered. Instead, opt for fewer, larger pieces. A single, substantial sofa will make a living room feel larger than a loveseat paired with small armchairs." },
      { heading: "The Power of Mirrors", text: "It is the oldest trick in the book for a reason. Mirrors bounce natural light deep into a room and create the illusion of depth. Place a large mirror opposite your biggest window to immediately double the perceived brightness." },
      { text: "Choose sofas and cabinets that sit on legs rather than resting directly on the floor. Seeing the floor continue underneath the furniture tricks the brain into perceiving more floor space." }
    ]
  },
  {
    id: "j-3",
    slug: "beauty-of-natural-materials",
    title: "The Beauty of Natural Materials",
    category: "MATERIALS",
    blurb: "Wood, linen, stone, and woven textures bring warmth into contemporary interiors.",
    image: "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=1200",
    date: "August 15, 2026",
    content: [
      { text: "In an increasingly digital world, our homes crave a connection to nature. Incorporating natural materials is the most effective way to introduce soul and warmth into a space. These materials age gracefully, developing patinas that tell a story." },
      { heading: "Wood as an Anchor", text: "Wood is unparalleled in its ability to bring warmth. The organic grain of wood softens the harsh straight lines typical of modern architecture. Do not be afraid to mix wood tones; a curated blend of walnut, ash, and oak looks sophisticated." },
      { heading: "Tactile Textiles", text: "Linen, wool, and jute offer sensory richness. A rumpled linen throw draped over a crisp leather sofa creates a beautiful tension. Similarly, a chunky wool rug anchors a room physically and visually, absorbing sound and adding comfort." },
      { text: "Natural materials are inherently imperfect. A knot in the wood, a variation in the glaze of a ceramic vase, or the slub of raw silk—these 'flaws' are exactly what give a room its character." }
    ]
  },
  {
    id: "j-4",
    slug: "calm-minimalist-space",
    title: "How to Create a Calm, Minimalist Space",
    category: "INTERIORS",
    blurb: "Practical styling advice using neutral tones and carefully selected décor.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    date: "August 04, 2026",
    content: [
      { text: "Minimalism isn't about having nothing—it's about having exactly what you need, and ensuring every item earns its place. A calm, minimalist living space provides a visual sanctuary from the noise of the outside world." },
      { heading: "Embrace the Void", text: "The most important element of minimalist styling is negative space. You do not need to fill every corner, every shelf, or every wall. Allowing empty space around a beautiful piece of furniture gives it breathing room." },
      { heading: "Restrain Your Palette", text: "A calm space relies on a cohesive, subdued color palette. Layer warm ivories, soft sands, and muted greys. When you do introduce color, do it through natural elements like green plants or art in earthy tones." },
      { text: "When you have fewer items in a room, the shape of those items becomes much more important. Choose décor with interesting, sculptural silhouettes to provide visual interest without creating clutter." }
    ]
  },
  {
    id: "j-5",
    slug: "refresh-your-living-room",
    title: "Simple Ways to Refresh Your Living Room",
    category: "STYLING",
    blurb: "Small changes in layout, lighting and accessories can make a room feel completely different.",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=1200",
    date: "July 22, 2026",
    content: [
      { text: "We all hit a point where our living room feels stagnant. Before you start browsing for a new sofa, consider the power of the 'mini-refresh'. Often, what a room needs isn't new furniture, but a new perspective." },
      { heading: "Adjust the Layout", text: "The instinct in many homes is to push every piece of furniture flat against the walls. Try pulling the sofa forward by even six inches. 'Floating' furniture creates intimate conversation areas and improves flow." },
      { heading: "Re-Style the Coffee Table", text: "Clear your coffee table completely. Start fresh. Place a large tray down as a base. Add a stack of books, a sculptural object, and a small vase. This simple vignette elevates the entire center of the room." },
      { text: "The fastest way to change a room's color palette without paint is through textiles. Swap out heavy velvet cushions for light, breezy linens. These soft elements inject immediate freshness." }
    ]
  },
  {
    id: "j-6",
    slug: "interior-trends-to-watch",
    title: "Interior Trends to Watch",
    category: "TRENDS",
    blurb: "Discover the styling principles behind understated, sophisticated modern interiors.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
    date: "July 10, 2026",
    content: [
      { text: "Interior design is moving away from overt branding, flashy hardware, and disposable trends. It is about understated elegance, impeccable craftsmanship, and an atmosphere of calm confidence." },
      { heading: "Prioritize Silhouette Over Embellishment", text: "Luxury lies in the lines. A simple, beautifully proportioned sofa in a plain fabric will always look more expensive than a heavily tufted, over-embellished piece. Look for clean, strong silhouettes." },
      { heading: "The Magic of Monochromatic Layering", text: "One of the easiest ways to elevate a room is tone-on-tone layering. A bedroom featuring ivory walls, cream sheets, and beige curtains feels incredibly sophisticated. The lack of high-contrast colours forces the eye to appreciate subtle textures." },
      { text: "Earthy undertones are also returning. We are seeing a resurgence of mushroom tones, deep terracottas, and olive greens acting as foundational colors that connect the home to the natural landscape." }
    ]
  }
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
