-- =============================================================================
-- LTRFL Template Seed Data
-- ~60 templates across 8 categories following LTRFL brand guidelines
-- =============================================================================

-- Sports & Recreation
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Sports & Recreation', 'Baseball', 'Baseball Glove Memorial',
 'Product photography of LTRFL baseball glove memorial keeper on vintage dugout bench. Ceramic weathered leather glove with detailed stitching and worn pocket, approximately 10 inches tall. Baseball, pine tar rag, stadium atmosphere. Shot on 50mm lens, warm nostalgic ballpark lighting, leather brown and stadium green tones, 4K quality, premium home decor aesthetic.',
 '{"team_color": "optional accent color", "personalization": "name/number area"}'),

('Sports & Recreation', 'Baseball', 'Baseball Cap Memorial',
 'Product photography of LTRFL baseball cap memorial keeper in home setting. Ceramic fitted cap with curved brim and embroidered panel detail, 8 inches tall. Displayed on wooden shelf with books and family photos. Warm natural window lighting, cream and sage tones, 4K quality, peaceful home decor aesthetic.',
 '{"team": "team name for embroidery", "color": "cap color"}'),

('Sports & Recreation', 'Basketball', 'Basketball Memorial',
 'Product photography of LTRFL basketball memorial keeper on polished hardwood floor. Ceramic textured basketball with realistic dimples and seams, 9 inches diameter. Gym setting with soft natural light from high windows. Warm orange and brown tones, 4K quality, sports memorabilia aesthetic.',
 '{"team_color": "accent stripe color", "personalization": "jersey number"}'),

('Sports & Recreation', 'Football', 'Football Helmet Memorial',
 'Product photography of LTRFL football helmet memorial keeper on leather chair. Ceramic helmet with facemask detail and glossy finish, 8 inches tall. Den setting with warm lamplight and trophy shelf. Rich leather browns and team colors, 4K quality, premium sports collectible aesthetic.',
 '{"team_color": "helmet color", "decal": "team logo area"}'),

('Sports & Recreation', 'Golf', 'Golf Bag Memorial',
 'Product photography of LTRFL golf bag memorial keeper in country club setting. Ceramic standing golf bag with club heads visible, 12 inches tall. Placed on green fairway grass with morning dew. Soft golden hour lighting, sage green and cream tones, 4K quality, refined elegance aesthetic.',
 '{"color": "bag color", "monogram": "initials area"}'),

('Sports & Recreation', 'Golf', 'Golf Ball on Tee Memorial',
 'Product photography of LTRFL golf ball memorial keeper on wooden display base. Ceramic dimpled golf ball on brass tee, 6 inches tall. Study setting with leather and wood accents. Warm afternoon lighting, white and gold tones, 4K quality, sophisticated home office aesthetic.',
 '{"engraving": "ball text area"}'),

('Sports & Recreation', 'Fishing', 'Fishing Reel Memorial',
 'Product photography of LTRFL fishing reel memorial keeper on weathered dock wood. Ceramic vintage fishing reel with handle and line detail, 7 inches wide. Lake setting with soft morning mist. Cool blue and warm brass tones, 4K quality, peaceful outdoor memory aesthetic.',
 '{"finish": "reel metal color"}'),

('Sports & Recreation', 'Hunting', 'Duck Decoy Memorial',
 'Product photography of LTRFL duck decoy memorial keeper in cabin setting. Ceramic mallard drake with painted feather detail, 10 inches long. Displayed on mantle with hunting photos. Warm firelight glow, natural earth tones, 4K quality, rustic americana aesthetic.',
 '{"species": "duck type", "base": "wood tone"}');

-- Pets & Animals
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Pets & Animals', 'Dogs', 'Sleeping Dog Memorial',
 'Product photography of LTRFL sleeping dog memorial keeper in cozy living room. Ceramic dog curled in peaceful sleeping pose, 8 inches long. Placed on soft throw blanket near fireplace. Warm golden lighting, cream and terracotta tones, 4K quality, loving home comfort aesthetic.',
 '{"breed": "dog breed", "color": "fur color"}'),

('Pets & Animals', 'Dogs', 'Sitting Dog Memorial',
 'Product photography of LTRFL sitting dog memorial keeper on garden path. Ceramic loyal dog in alert sitting pose with collar detail, 9 inches tall. Garden setting with flowers and greenery. Soft natural daylight, sage green and warm brown tones, 4K quality, peaceful garden memorial aesthetic.',
 '{"breed": "dog breed", "collar_color": "collar accent"}'),

('Pets & Animals', 'Dogs', 'Puppy with Ball Memorial',
 'Product photography of LTRFL playful puppy memorial keeper on hardwood floor. Ceramic puppy with tennis ball, capturing joyful energy, 7 inches tall. Sunny living room setting with toy basket. Bright cheerful lighting, warm yellows and browns, 4K quality, happy memory celebration aesthetic.',
 '{"breed": "puppy breed", "ball_color": "toy color"}'),

('Pets & Animals', 'Cats', 'Curled Cat Memorial',
 'Product photography of LTRFL curled cat memorial keeper on velvet cushion. Ceramic cat in peaceful curled sleeping pose, 6 inches diameter. Bedroom windowsill setting with soft curtains. Warm afternoon sunbeam lighting, cream and gray tones, 4K quality, serene comfort aesthetic.',
 '{"breed": "cat breed", "fur_pattern": "coat pattern"}'),

('Pets & Animals', 'Cats', 'Sitting Cat Memorial',
 'Product photography of LTRFL elegant sitting cat memorial keeper on bookshelf. Ceramic cat with regal posture and detailed features, 10 inches tall. Library setting with antique books. Warm lamplight, deep browns and sage tones, 4K quality, sophisticated companion aesthetic.',
 '{"breed": "cat breed", "eye_color": "eye color detail"}'),

('Pets & Animals', 'Horses', 'Horse Head Memorial',
 'Product photography of LTRFL horse head memorial keeper on barn wood base. Ceramic detailed horse portrait with flowing mane, 12 inches tall. Stable setting with hay and leather tack. Golden sunset lighting through barn door, warm chestnut and cream tones, 4K quality, noble equine tribute aesthetic.',
 '{"breed": "horse breed", "color": "coat color"}'),

('Pets & Animals', 'Birds', 'Cardinal Memorial',
 'Product photography of LTRFL cardinal memorial keeper on branch display. Ceramic bright red cardinal with detailed feathers, 6 inches tall. Garden window setting with snow-dusted evergreen. Soft winter light, vivid red and forest green tones, 4K quality, natural beauty memorial aesthetic.',
 '{"perch": "branch type", "season": "seasonal setting"}'),

('Pets & Animals', 'Butterflies', 'Monarch Butterfly Memorial',
 'Product photography of LTRFL monarch butterfly memorial keeper in glass dome display. Ceramic butterfly with intricate wing patterns, 5 inch wingspan. Garden room setting with potted plants. Soft diffused natural light, orange and black with sage accents, 4K quality, delicate transformation aesthetic.',
 '{"wing_color": "butterfly colors", "flowers": "accompanying blooms"}');

-- Hobbies & Interests
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Hobbies & Interests', 'Gardening', 'Watering Can Memorial',
 'Product photography of LTRFL vintage watering can memorial keeper in greenhouse. Ceramic galvanized watering can with rose spout detail, 8 inches tall. Surrounded by potted herbs and garden tools. Soft morning greenhouse light, sage green and copper tones, 4K quality, nurturing garden spirit aesthetic.',
 '{"finish": "metal patina", "flowers": "accompanying plants"}'),

('Hobbies & Interests', 'Gardening', 'Flower Pot Memorial',
 'Product photography of LTRFL terracotta flower pot memorial keeper with blooming flowers. Ceramic pot with sculpted flowers emerging, 9 inches tall. Garden patio setting with stone and greenery. Warm afternoon sunlight, terracotta and sage tones, 4K quality, growing legacy aesthetic.',
 '{"flower_type": "bloom variety", "pot_style": "pot decoration"}'),

('Hobbies & Interests', 'Music', 'Acoustic Guitar Memorial',
 'Product photography of LTRFL acoustic guitar memorial keeper on music stand. Ceramic guitar body with soundhole and string detail, 14 inches tall. Music room setting with sheet music and records. Warm amber lighting, natural wood and brass tones, 4K quality, melodic memory aesthetic.',
 '{"wood_tone": "guitar finish", "pick_guard": "style detail"}'),

('Hobbies & Interests', 'Music', 'Piano Keys Memorial',
 'Product photography of LTRFL piano keys memorial keeper on velvet-lined display. Ceramic curved section of piano keys with ebony and ivory detail, 10 inches wide. Concert hall inspired setting. Dramatic side lighting, classic black and white with gold accents, 4K quality, musical legacy aesthetic.',
 '{"key_count": "number of keys", "base": "display material"}'),

('Hobbies & Interests', 'Music', 'Vinyl Record Memorial',
 'Product photography of LTRFL vinyl record memorial keeper with album sleeve display. Ceramic 12-inch record with grooves and center label, spinning on turntable. Retro living room setting. Warm nostalgic lighting, black vinyl with colorful sleeve, 4K quality, timeless music lover aesthetic.',
 '{"label_design": "record label art", "sleeve_color": "album cover tones"}'),

('Hobbies & Interests', 'Art', 'Paint Palette Memorial',
 'Product photography of LTRFL artist palette memorial keeper in sunlit studio. Ceramic palette with colorful paint daubs and brushes, 11 inches wide. Art studio setting with canvas and easel. Natural north light, vibrant colors on warm wood, 4K quality, creative spirit aesthetic.',
 '{"colors": "paint color scheme", "brushes": "brush types"}'),

('Hobbies & Interests', 'Cooking', 'Chef Hat Memorial',
 'Product photography of LTRFL chef toque memorial keeper on marble counter. Ceramic traditional tall chef hat with pleated detail, 10 inches tall. Professional kitchen setting with copper pots. Warm kitchen lighting, white and copper tones, 4K quality, culinary passion aesthetic.',
 '{"height": "hat style", "accent": "ribbon color"}'),

('Hobbies & Interests', 'Reading', 'Open Book Memorial',
 'Product photography of LTRFL open book memorial keeper on reading nook shelf. Ceramic book with visible pages and leather cover, 8 inches wide. Cozy library corner with reading lamp. Warm amber lamplight, cream pages and leather brown, 4K quality, literary legacy aesthetic.',
 '{"cover": "book binding style", "pages": "page edge color"}'),

('Hobbies & Interests', 'Sewing', 'Sewing Machine Memorial',
 'Product photography of LTRFL vintage sewing machine memorial keeper on craft table. Ceramic classic Singer-style machine with wheel and needle detail, 9 inches long. Sewing room with fabric and thread. Soft natural light, black and gold with colorful thread accents, 4K quality, handmade with love aesthetic.',
 '{"finish": "machine color", "fabric": "accompanying material"}');

-- Professions
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Professions', 'Nurse', 'Nurse Cap Memorial',
 'Product photography of LTRFL nurse cap memorial keeper on medical cabinet. Ceramic traditional nurse cap with cross detail, 6 inches tall. Healthcare setting with soft clinical whites. Gentle compassionate lighting, white and soft blue tones, 4K quality, healing hands tribute aesthetic.',
 '{"style": "cap style", "emblem": "medical symbol"}'),

('Professions', 'Nurse', 'Stethoscope Heart Memorial',
 'Product photography of LTRFL stethoscope heart memorial keeper on wooden desk. Ceramic stethoscope coiled into heart shape, 7 inches wide. Medical office setting with diplomas and family photos. Warm professional lighting, silver and soft pink tones, 4K quality, caring heart aesthetic.',
 '{"tubing_color": "stethoscope color", "base": "display wood"}'),

('Professions', 'Teacher', 'Apple and Books Memorial',
 'Product photography of LTRFL teacher apple memorial keeper on stack of books. Ceramic red apple atop classic hardcover books, 8 inches tall. Classroom setting with chalkboard background. Warm afternoon light through windows, red apple with cream and brown books, 4K quality, lifelong learning legacy aesthetic.',
 '{"apple_color": "fruit color", "book_titles": "visible spines"}'),

('Professions', 'Firefighter', 'Fire Helmet Memorial',
 'Product photography of LTRFL firefighter helmet memorial keeper on firehouse shelf. Ceramic traditional helmet with shield and brim detail, 8 inches tall. Firehouse setting with equipment and photos. Dramatic side lighting, classic red or black with brass accents, 4K quality, heroic service tribute aesthetic.',
 '{"color": "helmet color", "department": "shield text"}'),

('Professions', 'Police', 'Police Badge Memorial',
 'Product photography of LTRFL police badge memorial keeper on presentation case. Ceramic detailed officer badge with star and text, 6 inches wide. Formal display setting with flag and honors. Respectful soft lighting, gold or silver with blue accents, 4K quality, protect and serve honor aesthetic.',
 '{"badge_type": "star/shield style", "department": "text inscription"}'),

('Professions', 'Military', 'Dog Tags Memorial',
 'Product photography of LTRFL military dog tags memorial keeper on folded flag display. Ceramic detailed dog tags on beaded chain, 5 inches long. Memorial display with American flag and medals. Solemn respectful lighting, silver tags on red white and blue, 4K quality, service and sacrifice honor aesthetic.',
 '{"branch": "military branch", "inscription": "tag text"}'),

('Professions', 'Chef', 'Chef Knife Memorial',
 'Product photography of LTRFL chef knife memorial keeper on butcher block. Ceramic professional knife with handle detail, 12 inches long. Professional kitchen setting with herbs and cutting boards. Warm kitchen lighting, steel blade with wood accents, 4K quality, culinary mastery tribute aesthetic.',
 '{"blade_type": "knife style", "handle": "wood type"}'),

('Professions', 'Mechanic', 'Wrench Memorial',
 'Product photography of LTRFL mechanics wrench memorial keeper on toolbox. Ceramic classic wrench with socket detail, 10 inches long. Garage workshop setting with tools and vintage car. Industrial warm lighting, chrome and oil-touched steel tones, 4K quality, hardworking hands tribute aesthetic.',
 '{"tool_type": "wrench variety", "finish": "metal patina"}');

-- Faith & Spirituality
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Faith & Spirituality', 'Angel', 'Guardian Angel Memorial',
 'Product photography of LTRFL guardian angel memorial keeper on marble pedestal. Ceramic serene angel with protective wings spread, 12 inches tall. Chapel-inspired setting with soft candlelight. Ethereal warm lighting, white and gold with soft cream, 4K quality, heavenly peace aesthetic.',
 '{"pose": "wing position", "expression": "face detail"}'),

('Faith & Spirituality', 'Angel', 'Praying Angel Memorial',
 'Product photography of LTRFL praying angel memorial keeper in garden alcove. Ceramic kneeling angel with hands folded in prayer, 10 inches tall. Peaceful garden sanctuary setting with flowers. Soft golden hour light through trees, white marble with sage surroundings, 4K quality, spiritual serenity aesthetic.',
 '{"style": "angel style", "base": "stone type"}'),

('Faith & Spirituality', 'Cross', 'Wooden Cross Memorial',
 'Product photography of LTRFL wooden cross memorial keeper on natural stone base. Ceramic rustic wood-textured cross with grain detail, 11 inches tall. Simple chapel setting with soft light through stained glass. Warm reverent lighting, natural wood tones with jewel color reflections, 4K quality, faithful remembrance aesthetic.',
 '{"wood_type": "grain style", "base": "stone color"}'),

('Faith & Spirituality', 'Cross', 'Celtic Cross Memorial',
 'Product photography of LTRFL Celtic cross memorial keeper on emerald velvet display. Ceramic ornate Celtic cross with knotwork detail, 10 inches tall. Irish heritage setting with clover and linen. Soft morning light, antique gold with emerald green accents, 4K quality, eternal heritage aesthetic.',
 '{"knotwork": "pattern style", "finish": "metal tone"}'),

('Faith & Spirituality', 'Praying Hands', 'Praying Hands Memorial',
 'Product photography of LTRFL praying hands memorial keeper on devotional table. Ceramic detailed praying hands with sleeve and rosary, 8 inches tall. Prayer room setting with candle and scripture. Soft candlelit warmth, cream and gold tones, 4K quality, devoted faith tribute aesthetic.',
 '{"style": "hand position", "accessory": "rosary/bible detail"}'),

('Faith & Spirituality', 'Buddha', 'Meditating Buddha Memorial',
 'Product photography of LTRFL Buddha memorial keeper in zen garden setting. Ceramic peaceful Buddha in lotus meditation pose, 9 inches tall. Japanese garden with raked sand and bamboo. Soft filtered natural light, bronze and sage green tones, 4K quality, enlightened peace aesthetic.',
 '{"pose": "mudra position", "finish": "patina style"}'),

('Faith & Spirituality', 'Star of David', 'Star of David Memorial',
 'Product photography of LTRFL Star of David memorial keeper on blue velvet display. Ceramic interlaced triangles with Hebrew letter detail, 8 inches wide. Synagogue-inspired setting with Torah scroll. Soft reverent lighting, silver and deep blue tones, 4K quality, covenant remembrance aesthetic.',
 '{"style": "star design", "inscription": "Hebrew text"}');

-- Travel & Adventure
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Travel & Adventure', 'Globe', 'World Globe Memorial',
 'Product photography of LTRFL world globe memorial keeper on mahogany stand. Ceramic detailed globe with raised continents and antique styling, 10 inches diameter. Study setting with maps and compass. Warm explorer lighting, antique cream and brass tones, 4K quality, worldly wanderer aesthetic.',
 '{"style": "map period", "stand": "wood finish"}'),

('Travel & Adventure', 'Suitcase', 'Vintage Suitcase Memorial',
 'Product photography of LTRFL vintage suitcase memorial keeper with travel stickers. Ceramic leather-textured suitcase with brass latches, 9 inches wide. Train station platform setting. Nostalgic warm lighting, worn leather brown with colorful travel stickers, 4K quality, journey of life aesthetic.',
 '{"stickers": "destination labels", "leather": "color and wear"}'),

('Travel & Adventure', 'Compass', 'Nautical Compass Memorial',
 'Product photography of LTRFL compass memorial keeper on maritime chart. Ceramic brass compass with detailed dial and case, 5 inches diameter. Ships cabin setting with rope and wood. Warm golden lamplight, polished brass and navy tones, 4K quality, true north guidance aesthetic.',
 '{"dial_style": "compass face", "case": "open/closed"}'),

('Travel & Adventure', 'Lighthouse', 'Lighthouse Memorial',
 'Product photography of LTRFL lighthouse memorial keeper on rocky base. Ceramic detailed lighthouse with light room and stripe pattern, 14 inches tall. Coastal setting with waves and seabirds. Dramatic coastal lighting, white and red with ocean blue, 4K quality, guiding light tribute aesthetic.',
 '{"stripe_color": "lighthouse pattern", "base": "rock type"}'),

('Travel & Adventure', 'Mountain', 'Mountain Peak Memorial',
 'Product photography of LTRFL mountain peak memorial keeper on wooden base. Ceramic snow-capped mountain with forest detail at base, 10 inches tall. Lodge setting with pine and leather. Warm alpine lighting, gray stone with white snow and forest green, 4K quality, summit of life aesthetic.',
 '{"peak_style": "mountain shape", "snow_level": "coverage amount"}'),

('Travel & Adventure', 'Anchor', 'Ships Anchor Memorial',
 'Product photography of LTRFL ships anchor memorial keeper on nautical rope coil. Ceramic detailed anchor with chain links and flukes, 11 inches tall. Harbor setting with wooden dock and sailboats. Golden sunset harbor light, aged iron with brass accents, 4K quality, steady anchor tribute aesthetic.',
 '{"finish": "metal patina", "rope": "coil style"}');

-- Vintage & Nostalgia
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Vintage & Nostalgia', 'Radio', 'Cathedral Radio Memorial',
 'Product photography of LTRFL cathedral radio memorial keeper on lace doily. Ceramic 1940s Gothic arch radio with dial and speaker cloth, 9 inches tall. Grandmothers parlor setting with vintage photos. Warm nostalgic amber lighting, rich wood tones with gold dial, 4K quality, golden age of radio aesthetic.',
 '{"wood_tone": "cabinet finish", "dial": "station markings"}'),

('Vintage & Nostalgia', 'Rotary Phone', 'Rotary Phone Memorial',
 'Product photography of LTRFL rotary telephone memorial keeper on telephone table. Ceramic classic rotary phone with dial and coiled cord, 8 inches wide. 1950s hallway setting with wallpaper and family photos. Warm home lighting, classic black with chrome accents, 4K quality, connected memories aesthetic.',
 '{"color": "phone color", "style": "desk/wall model"}'),

('Vintage & Nostalgia', 'Jukebox', 'Jukebox Memorial',
 'Product photography of LTRFL miniature jukebox memorial keeper on diner counter. Ceramic Wurlitzer-style jukebox with bubble tubes and chrome, 12 inches tall. 1950s diner setting with checkerboard floor. Neon-tinted warm lighting, chrome and colored lights, 4K quality, rock and roll memories aesthetic.',
 '{"style": "jukebox era", "colors": "light scheme"}'),

('Vintage & Nostalgia', 'Classic Car', '57 Chevy Memorial',
 'Product photography of LTRFL classic car memorial keeper on garage display. Ceramic 1957 Chevrolet Bel Air with chrome and fins detail, 11 inches long. Classic car garage setting with tools and memorabilia. Warm showroom lighting, two-tone paint with chrome highlights, 4K quality, American classic tribute aesthetic.',
 '{"paint": "car colors", "year": "model year"}'),

('Vintage & Nostalgia', 'Motorcycle', 'Harley Memorial',
 'Product photography of LTRFL motorcycle memorial keeper on leather saddlebag display. Ceramic classic Harley-Davidson with chrome and leather detail, 10 inches long. Open road biker setting with sunset. Golden hour dramatic lighting, chrome and black with leather brown, 4K quality, freedom rider aesthetic.',
 '{"style": "bike model", "chrome_level": "detail amount"}'),

('Vintage & Nostalgia', 'Record Player', 'Turntable Memorial',
 'Product photography of LTRFL record player memorial keeper with vinyl. Ceramic turntable with tonearm and spinning record, 10 inches square. Music room setting with album collection. Warm retro lighting, wood grain with silver components, 4K quality, audiophile memories aesthetic.',
 '{"wood": "cabinet finish", "record": "visible album"}');

-- Creative & Whimsical
INSERT INTO ltrfl_templates (category, subcategory, name, prompt, variables) VALUES
('Creative & Whimsical', 'Rubiks Cube', 'Rubiks Cube Memorial',
 'Product photography of LTRFL Rubiks Cube memorial keeper on puzzle display. Ceramic 3x3 cube with colorful squares partially solved, 5 inches cube. Game room setting with puzzles and brain teasers. Playful bright lighting, vibrant primary colors, 4K quality, puzzle of life aesthetic.',
 '{"solve_state": "cube pattern", "colors": "face scheme"}'),

('Creative & Whimsical', 'Lego Brick', 'LEGO Brick Memorial',
 'Product photography of LTRFL oversized LEGO brick memorial keeper on play table. Ceramic 2x4 LEGO brick with authentic stud detail, 8 inches long. Playroom setting with building creations. Fun colorful lighting, bright solid color with white interior, 4K quality, master builder tribute aesthetic.',
 '{"color": "brick color", "size": "brick dimensions"}'),

('Creative & Whimsical', 'Fortune Cookie', 'Fortune Cookie Memorial',
 'Product photography of LTRFL fortune cookie memorial keeper with fortune slip. Ceramic golden fortune cookie cracked open with paper emerging, 5 inches wide. Chinese restaurant setting with tea and chopsticks. Warm intimate lighting, golden cookie with red and gold accents, 4K quality, words of wisdom aesthetic.',
 '{"fortune": "message text", "finish": "cookie golden tone"}'),

('Creative & Whimsical', 'Snow Globe', 'Snow Globe Memorial',
 'Product photography of LTRFL snow globe memorial keeper with winter scene. Ceramic glass dome with house and falling snow, 7 inches tall. Mantle setting during holidays. Warm festive lighting, crystal clear dome with miniature scene inside, 4K quality, magical moment captured aesthetic.',
 '{"scene": "interior scene", "base": "base decoration"}'),

('Creative & Whimsical', 'Treasure Chest', 'Treasure Chest Memorial',
 'Product photography of LTRFL treasure chest memorial keeper with golden glow. Ceramic ornate chest with brass hardware slightly open revealing light within, 8 inches wide. Pirates cove adventure setting with maps and coins. Mysterious warm lighting, aged wood with gold overflow, 4K quality, precious treasures aesthetic.',
 '{"hardware": "metal details", "treasure": "visible contents"}'),

('Creative & Whimsical', 'Mason Jar', 'Mason Jar Memorial',
 'Product photography of LTRFL mason jar memorial keeper with fireflies. Ceramic vintage Ball jar with lid and captured firefly lights, 7 inches tall. Summer porch evening setting with rocking chair. Magical twilight lighting, clear glass with warm glowing dots inside, 4K quality, capturing summer nights aesthetic.',
 '{"jar_style": "embossing text", "light_count": "firefly amount"}');
