-- Seed Products

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000001', 'minimalist-wooden-wall-clock', 'Minimalist Wooden Wall Clock', 'wall-clocks', 'Silent Clocks', 269, 2499, 4.7, 218, 'img6', 'minimalist', 'Seasoned Sheesham Wood', 'Natural Oak', 'Medium', '30 x 30 x 4 cm', '1.1 kg', 'A pared-back dial in seasoned wood with a whisper-quiet sweep movement — designed to read the hour without shouting for attention.', 'Wipe with a dry, soft cloth. Keep away from direct moisture.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 24) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000002', 'walnut-roman-numeral-clock', 'Walnut Roman Numeral Clock', 'wall-clocks', 'Statement Clocks', 279, 3499, 4.6, 132, 'img12', 'vintage', 'Walnut Finish MDF', 'Deep Walnut', 'Large', '40 x 40 x 5 cm', '1.6 kg', 'Slim brass hands over a warm walnut face, finished by hand for an heirloom feel above the console.', 'Dust gently. Avoid abrasive cleaners.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000002', 'Default', 12) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000003', 'brass-accent-skeleton-clock', 'Brass Accent Skeleton Clock', 'wall-clocks', 'Luxury Clocks', 289, 5999, 4.8, 76, 'img11', 'luxury', 'Metal & Brass Plating', 'Antique Brass', 'Large', '50 x 50 x 5 cm', '2.4 kg', 'An open-frame dial ringed in antique brass — sculptural enough to work as wall art on its own.', 'Polish with a dry microfibre cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000003', 'Default', 8) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000004', 'carved-wooden-wall-art-panel', 'Carved Wooden Wall Art Panel', 'wall-decor', 'Wood Panels', 299, 4199, 4.7, 164, 'img2', 'rustic', 'Mango Wood', 'Warm Brown', 'Large', '60 x 60 x 4 cm', '3.2 kg', 'Hand-carved leaf relief set into a geometric grid — the kind of piece that gives a plain wall texture and shadow.', 'Dust weekly. Do not wash.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000004', 'Default', 15) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000005', 'rustic-wooden-photo-frame-set', 'Rustic Wooden Photo Frame Set', 'wall-decor', 'Photo Frames', 259, 1499, 4.4, 306, 'img8', 'rustic', 'Pine Wood', 'Driftwood Grey', 'Set of 2 (5x7 in)', '20 x 25 x 2 cm', '0.8 kg', 'Softly distressed pine frames with ivory mats — table-top or wall, they flatter every photograph.', 'Clean glass with a dry cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000005', 'Default', 40) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000006', 'oak-gallery-frame-trio', 'Oak Gallery Frame Trio', 'frames', 'Gallery Frames', 269, 1999, 4.6, 187, 'frame', 'minimalist', 'Solid Oak', 'Light Oak', 'Set of 3 (A4)', '21 x 30 cm each', '1.4 kg', 'Three slim oak frames sized for A4 prints — the easiest way to start a gallery wall.', 'Wipe with a dry cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000006', 'Default', 30) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000007', 'beige-botanical-poster', 'Beige Botanical Poster', 'posters', 'Botanical Prints', 279, 1299, 4.5, 241, 'poster', 'minimalist', '300 GSM Matte Art Paper', 'Beige & Ivory', 'A3 Framed', '30 x 42 cm', '0.9 kg', 'Fine line botanicals printed on heavyweight matte paper and framed in light oak — quiet, warm, endlessly wearable.', 'Keep out of direct sunlight.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000007', 'Default', 50) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000008', 'typography-art-print-home', 'Typography Art Print — Home', 'posters', 'Typography Art', 289, 1399, 4.3, 121, 'img15', 'contemporary', 'Matte Art Paper', 'Sand', 'A3 Framed', '30 x 42 cm', '0.9 kg', 'A single word, generously spaced — understated typography for an entryway wall.', 'Dust the glass gently.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000008', 'Default', 35) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000009', 'terracotta-abstract-canvas', 'Terracotta Abstract Canvas', 'canvas-art', 'Abstract Canvas', 299, 6999, 4.8, 143, 'canvas', 'modern', 'Cotton Canvas, Wooden Frame', 'Terracotta & Sage', 'Extra Large', '90 x 120 x 4 cm', '5.1 kg', 'Broad terracotta and sage strokes on gallery-wrapped cotton canvas — a room''s whole colour story in one piece.', 'Dust lightly. Never use water.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000009', 'Default', 6) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000010', 'muted-landscape-canvas', 'Muted Landscape Canvas', 'canvas-art', 'Landscape Canvas', 259, 4499, 4.4, 87, 'canvas', 'contemporary', 'Cotton Canvas', 'Sand & Grey', 'Large', '60 x 90 x 4 cm', '3.2 kg', 'A hazy horizon in muted neutrals, stretched over a kiln-dried frame.', 'Dust with a soft brush.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000010', 'Default', 14) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000011', 'golden-swirl-resin-wall-art', 'Golden Swirl Resin Wall Art', 'abstract-art', 'Resin Art', 269, 4999, 4.7, 112, 'img1', 'luxury', 'Epoxy Resin on MDF', 'Ivory & Gold', 'Medium', '45 x 45 x 3 cm', '2.8 kg', 'Poured resin marbling with real gold leaf veins — every panel sets differently, so no two are alike.', 'Wipe with a damp cloth; avoid solvents.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000011', 'Default', 9) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000012', 'ivory-marble-effect-resin-panel', 'Ivory Marble Effect Resin Panel', 'abstract-art', 'Resin Art', 279, 3899, 4.5, 64, 'resin', 'modern', 'Epoxy Resin', 'Ivory', 'Small', '30 x 30 x 3 cm', '1.6 kg', 'Soft ivory marbling with a high-gloss finish, sized for a narrow wall or shelf lean.', 'Avoid prolonged direct sun.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000012', 'Default', 18) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000013', 'abstract-stone-sculpture', 'Abstract Stone Sculpture', 'sculptures', 'Marble Sculpture', 289, 7999, 4.9, 58, 'sculpture', 'luxury', 'Hand-carved Marble & Sandstone', 'White & Sand', 'Medium', '22 x 14 x 30 cm', '4.8 kg', 'Two stones in conversation — one polished marble arc, one raw sandstone base, finished entirely by hand.', 'Dust with a dry cloth. Lift from the base.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000013', 'Default', 5) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000014', 'sandstone-arch-object', 'Sandstone Arch Object', 'sculptures', 'Stone Objects', 299, 3299, 4.4, 44, 'sculpture', 'minimalist', 'Sandstone', 'Sand', 'Small', '14 x 8 x 18 cm', '1.9 kg', 'A small carved arch that adds quiet weight to a bookshelf or console.', 'Dust only.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000014', 'Default', 16) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000015', 'marble-finish-twist-showpiece', 'Marble Finish Twist Showpiece', 'sculptures', 'Table Sculpture', 259, 3999, 4.6, 129, 'showpiece', 'luxury', 'Resin with Marble Finish', 'White & Gold', 'Medium', '12 x 12 x 26 cm', '1.4 kg', 'A twisting marble-effect form banded in gold — glossy, sculptural and surprisingly light.', 'Wipe with a soft dry cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000015', 'Default', 20) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000016', 'bronze-figurine-duo', 'Bronze Figurine Duo', 'sculptures', 'Figurines', 269, 4799, 4.5, 71, 'bannerStatement', 'vintage', 'Polyresin, Bronze Finish', 'Antique Bronze', 'Set of 2', '16 x 10 x 28 cm', '2.6 kg', 'A pair of antique-bronze figures with beautifully aged patina for a console tableau.', 'Dust gently; do not wash.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000016', 'Default', 11) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000017', 'contemporary-table-vase', 'Contemporary Table Vase', 'wall-decor', 'Ceramic Vases', 279, 1899, 4.6, 264, 'img13', 'minimalist', 'Glazed Ceramic', 'Ivory', 'Medium', '14 x 14 x 24 cm', '1.2 kg', 'A rounded ceramic silhouette with a soft ivory glaze — beautiful bare, better with pampas.', 'Hand wash. Not dishwasher safe.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000017', 'Default', 38) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000018', 'speckled-stoneware-bud-vase', 'Speckled Stoneware Bud Vase', 'showpieces', 'Bud Vases', 289, 999, 4.3, 178, 'tray', 'scandinavian', 'Stoneware', 'Speckled Grey', 'Small', '8 x 8 x 14 cm', '0.5 kg', 'A palm-sized bud vase with a speckled matte body for single stems.', 'Rinse by hand.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000018', 'Default', 45) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000019', 'tall-fluted-floor-vase', 'Tall Fluted Floor Vase', 'vases', 'Floor Vases', 299, 5299, 4.7, 52, 'vase', 'modern', 'Ceramic', 'Cream', 'Extra Large', '24 x 24 x 55 cm', '4.2 kg', 'A fluted floor vase built for dramatic dried arrangements beside a sofa.', 'Wipe clean; use a liner for water.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000019', 'Default', 7) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000020', 'modern-ceramic-planter', 'Modern Ceramic Planter', 'plants-planters', 'Planters', 259, 1699, 4.5, 209, 'planter', 'contemporary', 'Ceramic with Drainage', 'Speckled Ivory', 'Medium', '18 x 18 x 18 cm', '1.5 kg', 'A speckled ivory planter with a sand-toned foot and proper drainage hole.', 'Use a saucer indoors.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000020', 'Default', 33) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000021', 'artificial-monstera-in-pot', 'Artificial Monstera in Pot', 'plants-planters', 'Artificial Plants', 269, 2799, 4.4, 156, 'planter', 'boho', 'Silk Leaf, Ceramic Pot', 'Green & Ivory', 'Large', '40 x 40 x 70 cm', '2.1 kg', 'Lifelike monstera leaves in a ceramic pot — all of the green, none of the watering.', 'Dust leaves with a damp cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000021', 'Default', 22) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000022', 'arched-brass-wall-mirror', 'Arched Brass Wall Mirror', 'mirrors', 'Arch Mirrors', 279, 8999, 4.8, 94, 'mirror', 'luxury', 'Metal Frame, 5mm Mirror', 'Brushed Brass', 'Large', '60 x 90 x 3 cm', '7.4 kg', 'A slim brass arch that bounces daylight down a hallway and makes small rooms breathe.', 'Clean with a lint-free cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000022', 'Default', 6) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000023', 'round-minimal-vanity-mirror', 'Round Minimal Vanity Mirror', 'mirrors', 'Round Mirrors', 289, 3799, 4.5, 118, 'mirror', 'minimalist', 'Metal Frame', 'Matte Champagne', 'Medium', '50 x 50 x 3 cm', '3.9 kg', 'A perfectly plain circle with a hairline frame — quiet above a basin or dresser.', 'Avoid ammonia-based cleaners.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000023', 'Default', 19) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000024', 'linen-shade-table-lamp', 'Linen Shade Table Lamp', 'showpieces', 'Table Lamps', 299, 3399, 4.6, 174, 'lamp', 'contemporary', 'Ceramic Base, Linen Shade', 'Ivory & Brass', 'Medium', '28 x 28 x 46 cm', '2.3 kg', 'A glazed ceramic base with a brass collar and textured linen shade — the warmest light in the room.', 'Unplug before wiping the base.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000024', 'Default', 21) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000025', 'brass-cylinder-bedside-lamp', 'Brass Cylinder Bedside Lamp', 'showpieces', 'Bedside Lamps', 259, 2299, 4.4, 96, 'roomBedroom', 'modern', 'Metal & Fabric', 'Brass', 'Small', '12 x 12 x 24 cm', '0.9 kg', 'A compact cylinder that throws soft light exactly where a bedside table needs it.', 'Dust the shade with a brush.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000025', 'Default', 27) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000026', 'ivory-pillar-candle-set-with-brass-holders', 'Ivory Pillar Candle Set with Brass Holders', 'showpieces', 'Candle Sets', 269, 1999, 4.7, 231, 'candle', 'luxury', 'Soy Wax, Solid Brass', 'Ivory & Brass', 'Set of 3', 'Holders 9 cm dia', '1.7 kg', 'Three unscented soy pillars on turned brass plates — a five-minute way to make dinner feel considered.', 'Trim wick to 5 mm before lighting.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000026', 'Default', 29) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000027', 'brass-taper-candle-holders', 'Brass Taper Candle Holders', 'showpieces', 'Candle Holders', 279, 1599, 4.5, 141, 'tray', 'vintage', 'Solid Brass', 'Antique Brass', 'Set of 2', '7 x 7 x 12 cm', '0.8 kg', 'Weighted brass holders for slim tapers, aged to a soft antique tone.', 'Polish occasionally with brass cleaner.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000027', 'Default', 24) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000028', 'wooden-serving-tray-with-brass-handles', 'Wooden Serving Tray with Brass Handles', 'showpieces', 'Trays', 289, 2599, 4.6, 163, 'tray', 'rustic', 'Acacia Wood, Brass', 'Natural & Brass', 'Large', '45 x 30 x 5 cm', '1.8 kg', 'A generous acacia tray with brass handles — the styling shortcut every coffee table needs.', 'Oil occasionally. Do not soak.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000028', 'Default', 26) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000029', 'marble-centerpiece-bowl', 'Marble Centerpiece Bowl', 'wall-decor', 'Centerpieces', 299, 4299, 4.5, 68, 'img14', 'luxury', 'Natural Marble', 'White Marble', 'Medium', '26 x 26 x 8 cm', '3.4 kg', 'A shallow marble bowl for fruit, keys or nothing at all.', 'Wipe with a damp cloth; blot spills quickly.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000029', 'Default', 12) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000030', 'macrame-dream-catcher', 'Macrame Dream Catcher', 'wall-decor', 'Dream Catchers', 259, 1499, 4.4, 197, 'img5', 'boho', 'Cotton Cord, Natural Feathers', 'Ivory & Tan', 'Medium', '25 x 70 cm', '0.3 kg', 'Hand-knotted cotton with a woven sunburst centre and soft feather tails.', 'Shake gently to dust.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000030', 'Default', 41) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000031', 'woven-cotton-wall-hanging', 'Woven Cotton Wall Hanging', 'wall-decor', 'Macrame', 269, 2199, 4.3, 84, 'img4', 'boho', 'Cotton Cord, Wooden Dowel', 'Natural', 'Large', '60 x 90 cm', '0.7 kg', 'A large macrame panel with layered fringe that softens hard walls beautifully.', 'Spot clean only.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000031', 'Default', 17) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000032', 'marble-gold-bookend-pair', 'Marble & Gold Bookend Pair', 'sculptures', 'Bookends', 279, 2999, 4.6, 73, 'showpiece', 'luxury', 'Marble & Brass', 'White & Gold', 'Set of 2', '10 x 10 x 15 cm each', '2.9 kg', 'Weighted marble blocks with brass edging that hold a shelf of books in line.', 'Dust with a dry cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000032', 'Default', 15) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000033', 'ceramic-object-trio', 'Ceramic Object Trio', 'vases', 'Decorative Objects', 289, 2499, 4.2, 61, 'vase', 'minimalist', 'Ceramic', 'Ivory', 'Set of 3', 'Various, 10-18 cm', '1.6 kg', 'Three small ceramic forms in graduated heights — styling made simple.', 'Hand wipe.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000033', 'Default', 23) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000034', 'sculptural-wall-art-in-sandstone', 'Sculptural Wall Art in Sandstone', 'wall-decor', 'Sculptural Wall Art', 299, 6499, 4.7, 49, 'img10', 'contemporary', 'Cast Sandstone', 'Sand', 'Large', '70 x 50 x 6 cm', '6.2 kg', 'A relief panel cast in sandstone that reads as sculpture and hangs like art.', 'Dust with a soft brush.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000034', 'Default', 5) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000035', 'minimal-line-art-canvas', 'Minimal Line Art Canvas', 'posters', 'Minimal Art', 259, 2899, 4.4, 133, 'poster', 'minimalist', 'Canvas, Oak Frame', 'Ivory', 'Medium', '40 x 60 x 3 cm', '1.8 kg', 'One continuous line on raw canvas, framed in pale oak.', 'Dust lightly.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000035', 'Default', 28) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000036', 'antique-brass-wall-clock', 'Antique Brass Wall Clock', 'wall-decor', 'Vintage Clocks', 269, 4199, 4.5, 88, 'img9', 'vintage', 'Metal, Glass', 'Aged Brass', 'Medium', '36 x 36 x 5 cm', '1.9 kg', 'A gently aged brass rim with a cream dial and elegant serif numerals.', 'Dust with a dry cloth.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000036', 'Default', 13) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000037', 'terracotta-textured-planter', 'Terracotta Textured Planter', 'plants-planters', 'Planters', 279, 1199, 4.2, 112, 'planter', 'boho', 'Terracotta', 'Terracotta', 'Small', '14 x 14 x 14 cm', '0.9 kg', 'Ribbed terracotta with a raw unglazed finish that ages beautifully outdoors.', 'Rinse before repotting.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000037', 'Default', 47) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000038', 'framed-botanical-set-of-3', 'Framed Botanical Set of 3', 'posters', 'Framed Sets', 289, 3499, 4.6, 152, 'poster', 'scandinavian', 'Art Paper, Oak Frames', 'Beige', 'Set of 3 (A4)', '21 x 30 cm each', '2.4 kg', 'A curated trio of botanical studies, framed and ready to hang as a set.', 'Keep away from damp walls.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000038', 'Default', 20) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000039', 'statement-sculpture-on-marble-base', 'Statement Sculpture on Marble Base', 'sculptures', 'Statement Sculpture', 299, 11999, 4.9, 37, 'bannerStatement', 'luxury', 'Bronze Finish Resin, Marble', 'Bronze & White', 'Extra Large', '30 x 20 x 55 cm', '8.6 kg', 'An unmistakably sculptural piece on a solid marble plinth — built to hold the centre of an entryway.', 'Dust with a dry cloth. Two-person lift.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000039', 'Default', 3) ON CONFLICT (product_id, variant) DO NOTHING;

INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '00000000-0000-0000-0000-000000000040', 'wooden-mandala-wall-panel', 'Wooden Mandala Wall Panel', 'wall-decor', 'Wood Panels', 259, 3199, 4.5, 176, 'img7', 'vintage', 'MDF with Wood Veneer', 'Honey Brown', 'Medium', '45 x 45 x 3 cm', '2.2 kg', 'A finely cut mandala in warm veneer that throws lovely shadow in evening light.', 'Dust with a soft brush.'
  ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.inventory (product_id, variant, stock) VALUES ('00000000-0000-0000-0000-000000000040', 'Default', 25) ON CONFLICT (product_id, variant) DO NOTHING;

