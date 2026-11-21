export interface IngredientDictionaryEntry {
	id: string;
	names: {
		en: string[];
		hi: string[];
		mr: string[];
		aliases: string[];
	};
}

export const ingredientDictionary: IngredientDictionaryEntry[] = [
	{
		id: 'coriander-leaves',
		names: {
			en: ['Coriander', 'Coriander Leaves', 'Cilantro'],
			hi: ['धनिया', 'हरा धनिया'],
			mr: ['कोथिंबीर'],
			aliases: ['Dhaniya', 'Hara Dhaniya', 'Kothimbir', 'Kothmir']
		}
	},
	{
		id: 'coriander-seeds',
		names: {
			en: ['Coriander Seeds', 'Whole Coriander'],
			hi: ['धनिया बीज', 'साबुत धनिया'],
			mr: ['धणे'],
			aliases: ['Dhaniya Seeds', 'Whole Dhaniya']
		}
	},
	{
		id: 'coriander-powder',
		names: {
			en: ['Coriander Powder', 'Ground Coriander'],
			hi: ['धनिया पाउडर', 'पिसा धनिया'],
			mr: ['धणे पूड', 'धणे पावडर'],
			aliases: ['Dhaniya Powder', 'Ground Dhaniya']
		}
	},
	{ id: 'potato', names: { en: ['Potato', 'Potatoes'], hi: ['आलू'], mr: ['बटाटा'], aliases: ['Aloo', 'Batata'] } },
	{ id: 'tomato', names: { en: ['Tomato', 'Tomatoes'], hi: ['टमाटर'], mr: ['टोमॅटो'], aliases: ['Tamatar', 'Tomato'] } },
	{ id: 'onion', names: { en: ['Onion', 'Onions'], hi: ['प्याज'], mr: ['कांदा'], aliases: ['Pyaaz', 'Pyaz', 'Kanda'] } },
	{ id: 'garlic', names: { en: ['Garlic'], hi: ['लहसुन'], mr: ['लसूण'], aliases: ['Lahsun', 'Lasun'] } },
	{ id: 'ginger', names: { en: ['Ginger'], hi: ['अदरक'], mr: ['आले'], aliases: ['Adrak', 'Aale'] } },
	{ id: 'cumin', names: { en: ['Cumin', 'Cumin Seeds'], hi: ['जीरा'], mr: ['जिरे'], aliases: ['Jeera', 'Jira'] } },
	{ id: 'turmeric', names: { en: ['Turmeric'], hi: ['हल्दी'], mr: ['हळद'], aliases: ['Haldi', 'Halad'] } },
	{ id: 'spinach', names: { en: ['Spinach'], hi: ['पालक'], mr: ['पालक'], aliases: ['Palak'] } },
	{ id: 'chickpea', names: { en: ['Chickpea', 'Chickpeas', 'Garbanzo Beans'], hi: ['चना'], mr: ['हरभरा'], aliases: ['Chana', 'Harbhara'] } },
	{ id: 'cauliflower', names: { en: ['Cauliflower'], hi: ['फूलगोभी'], mr: ['फुलकोबी'], aliases: ['Phool Gobi', 'Gobi', 'Phulkobi'] } },
	{ id: 'eggplant', names: { en: ['Eggplant', 'Aubergine'], hi: ['बैंगन'], mr: ['वांगी'], aliases: ['Baingan', 'Vangi'] } },
	{ id: 'green-chili', names: { en: ['Green Chili', 'Green Chilli'], hi: ['हरी मिर्च'], mr: ['हिरवी मिरची'], aliases: ['Hari Mirch', 'Hirvi Mirchi'] } },
	{ id: 'lemon', names: { en: ['Lemon'], hi: ['नींबू'], mr: ['लिंबू'], aliases: ['Nimbu', 'Limbu'] } },
	{ id: 'rice', names: { en: ['Rice'], hi: ['चावल'], mr: ['तांदूळ'], aliases: ['Chawal', 'Tandul'] } },
	{ id: 'fenugreek-leaves', names: { en: ['Fenugreek Leaves'], hi: ['मेथी'], mr: ['मेथी'], aliases: ['Methi'] } },
	{ id: 'okra', names: { en: ['Okra', 'Ladyfinger'], hi: ['भिंडी'], mr: ['भेंडी'], aliases: ['Bhindi', 'Bhendi'] } },
	{ id: 'lentils', names: { en: ['Lentils'], hi: ['दाल'], mr: ['डाळ'], aliases: ['Dal', 'Daal'] } },
	{ id: 'black-pepper', names: { en: ['Black Pepper', 'Peppercorn'], hi: ['काली मिर्च'], mr: ['काळी मिरी'], aliases: ['Kali Mirch', 'Pepper'] } },
	{ id: 'bell-pepper', names: { en: ['Bell Pepper', 'Capsicum'], hi: ['शिमला मिर्च'], mr: ['ढोबळी मिरची'], aliases: ['Shimla Mirch', 'Dholi Mirchi', 'Pepper'] } },
	{ id: 'salt', names: { en: ['Salt'], hi: ['नमक'], mr: ['मीठ'], aliases: ['Namak', 'Meeth'] } },
	{ id: 'olive-oil', names: { en: ['Olive Oil'], hi: ['जैतून का तेल'], mr: ['ऑलिव्ह तेल'], aliases: ['Zaitoon Oil'] } },
	{ id: 'water', names: { en: ['Water'], hi: ['पानी'], mr: ['पाणी'], aliases: ['Pani'] } },
	{ id: 'milk', names: { en: ['Milk'], hi: ['दूध'], mr: ['दूध'], aliases: ['Doodh', 'Dudh'] } },
	{ id: 'egg', names: { en: ['Egg', 'Eggs'], hi: ['अंडा', 'अंडे'], mr: ['अंडे'], aliases: ['Anda', 'Ande'] } },
	{ id: 'chicken', names: { en: ['Chicken'], hi: ['चिकन', 'मुर्गा'], mr: ['चिकन'], aliases: ['Murgi', 'Murga'] } },
	{ id: 'carrot', names: { en: ['Carrot', 'Carrots'], hi: ['गाजर'], mr: ['गाजर'], aliases: ['Gajar'] } },
	{ id: 'cucumber', names: { en: ['Cucumber'], hi: ['खीरा'], mr: ['काकडी'], aliases: ['Kheera', 'Kakdi'] } },
	{ id: 'yogurt', names: { en: ['Yogurt', 'Yoghurt', 'Curd'], hi: ['दही'], mr: ['दही'], aliases: ['Dahi'] } },
	{ id: 'peanut', names: { en: ['Peanut', 'Peanuts'], hi: ['मूंगफली'], mr: ['शेंगदाणा'], aliases: ['Moongphali', 'Shengdana'] } },
	{ id: 'oats', names: { en: ['Oats'], hi: ['ओट्स'], mr: ['ओट्स'], aliases: ['Jaee'] } },
	{ id: 'mustard-seeds', names: { en: ['Mustard Seeds'], hi: ['सरसों'], mr: ['मोहरी'], aliases: ['Sarson', 'Mohari'] } },
	{ id: 'coconut', names: { en: ['Coconut'], hi: ['नारियल'], mr: ['नारळ'], aliases: ['Nariyal', 'Naral'] } },
	{ id: 'butter', names: { en: ['Butter'], hi: ['मक्खन'], mr: ['लोणी'], aliases: ['Makkhan', 'Loni'] } }
];

export type IngredientResolution =
	| { status: 'known'; canonicalId: string }
	| { status: 'unknown'; canonicalId: string }
	| { status: 'ambiguous'; canonicalIds: string[] };

export function normalizeIngredientName(value: string): string {
	return value
		.normalize('NFKC')
		.toLocaleLowerCase()
		.replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
		.replace(/[\s-]+/g, ' ')
		.trim();
}

const aliases = ingredientDictionary.flatMap((entry) => [
	...entry.names.en,
	...entry.names.hi,
	...entry.names.mr,
	...entry.names.aliases
].map((name) => ({ name: normalizeIngredientName(name), id: entry.id })).filter((alias) => alias.name));

export function resolveIngredientName(value: string): IngredientResolution {
	const normalized = normalizeIngredientName(value);
	if (!normalized) return { status: 'unknown', canonicalId: 'raw:' };

	const matches = aliases
		.filter(({ name }) => normalized === name || ` ${normalized} `.includes(` ${name} `))
		.sort((left, right) => right.name.length - left.name.length);
	if (matches.length > 0) {
		const longest = matches[0].name.length;
		const ids = [...new Set(matches.filter((match) => match.name.length === longest).map((match) => match.id))];
		if (ids.length > 1) return { status: 'ambiguous', canonicalIds: ids };
		return { status: 'known', canonicalId: ids[0] };
	}
	return { status: 'unknown', canonicalId: `raw:${normalized}` };
}

export function pantryInputFeedback(values: string[]): { unknown: string[]; ambiguous: string[] } {
	const unknown: string[] = [];
	const ambiguous: string[] = [];
	for (const value of values) {
		const resolution = resolveIngredientName(value);
		if (resolution.status === 'unknown') unknown.push(value);
		if (resolution.status === 'ambiguous') ambiguous.push(value);
	}
	return { unknown, ambiguous };
}