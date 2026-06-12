import { PrismaClient } from "@prisma/client"
import { prisma } from "./prisma"
import { validateSlug } from "./slug"

export type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]

interface StudioCreationInput {
  name: string
  slug: string
  logo?: string
  // DPA acceptance — computed server-side by the caller, never client-supplied
  dpaAcceptedAt?: Date
  dpaVersion?: string
}

type StudioValidation =
  | { valid: true }
  | { valid: false; reason: string }

export function validateStudioCreation(
  input: Pick<StudioCreationInput, "name" | "slug">
): StudioValidation {
  if (!input.name || !input.name.trim()) {
    return { valid: false, reason: "Studio name is required" }
  }

  const slugValidation = validateSlug(input.slug)
  if (!slugValidation.valid) {
    return slugValidation
  }

  return { valid: true }
}

// Default tattoo styles — same as the MERN app / seed data
const DEFAULT_STYLES = [
  {
    value: "FineLine",
    description:
      "Fine line tattooing consists of distinct straight or curved thin lines, without gradations in shade or color to represent 2D or 3D objects, emphasizing form and outline over color, shading, and texture. These tattoos can have incredible levels of detail built in, without being 'loud' about it.",
    wallPaper: "styles/mg_63bf36c2c3cf5018e63959ea/1705989076302_90345086fd58.jpg",
    nonStyle: false,
  },
  {
    value: "Black@Gray",
    description:
      'Black-and-gray is sometimes referred to as "jailhouse" or "joint style" and is thought to have originated in prisons where inmates had limited access to different materials; they resorted to using guitar strings for needles and used cigarette ashes or pen ink to produce tattoos.',
    wallPaper: "styles/mg_650349d7f56daad5f49df4e9/1705990192452_15d45932b76c.jpg",
    nonStyle: false,
  },
  {
    value: "No Style",
    description:
      "Here the images of tattoos which difficult to define which style it is actually",
    wallPaper: "styles/mg_655a218dbf8c718670be6a58/1712734019347_0e6f74759321.jpg",
    nonStyle: true,
  },
  {
    value: "BlackWork",
    description:
      "A blackwork tattoo is a bold work of body art rendered in solid planes of black ink. Usually, these tattoos are composed of abstract patterns and geometric shapes, though some feature figurative forms and recognizable scenes and subjects.",
    wallPaper: "styles/mg_65ad683491d96372e7947ad8/1705988606001_eb5bfbe27e4e.jpg",
    nonStyle: false,
  },
  {
    value: "NeoTraditional",
    description:
      "Neo-traditional tattoo designs feature bold, dark outlines and illustrative looks. There is a feeling of subtle dimension and the use of saturated colors. This dimension is not a 3D type of tattoo, yet they contain lines that vary in weight. This style of tattoo art consists of an illustrated look.",
    wallPaper: "styles/mg_65ad685191d96372e7947add/1705988298732_06afd4950285.jpg",
    nonStyle: false,
  },
  {
    value: "Realistic",
    description:
      "Realism tattoos can depict anything, with the only requirement being that the tattoo looks as close to photorealistic as possible. Portraits of famous people, loved ones, nature, and meaningful objects are all common choices for realistic tattoos.",
    wallPaper: "styles/mg_65be73db5b50bdfa55dabf00/1716730967403_9696c3542d5b.jpg",
    nonStyle: false,
  },
  {
    value: "Designs",
    description: "Here you can see some of my designs and drawings.",
    wallPaper: "styles/mg_663602db8b824c641813786e/1715001956431_728b5fd67cd6.jpg",
    nonStyle: false,
  },
]

const DEFAULT_SERVICES = [
  {
    title: "TATTOO SESSION",
    conditions:
      "1000 kr -minimum cost up to one hour\n1000 kr/hour - no longer then 4 hours\n700 kr/hour cost for each next hour if session longer then 4 hours\nmax session 90 hours",
    order: 0,
  },
  {
    title: "CAVER UP",
    conditions:
      "1000 kr -minimum cost up to one hour\n1000 kr/hour - no longer then 4 hours\n700 kr/hour cost for each next hour if session longer then 4 hours\nmax session 6 hours",
    order: 1,
  },
  {
    title: "INDIVIDUAL DESIGN",
    conditions:
      "1000 kr -minimum cost up to one hour\n1000 kr/hour - no longer then 4 hours\n700 kr/hour cost for each next hour if session longer then 4 hours\nmax session 6 hours",
    order: 2,
  },
  {
    title: "CONSULTATION",
    conditions:
      "1000 kr -minimum cost up to one hour\n1000 kr/hour - no longer then 4 hours\n700 kr/hour cost for each next hour if session longer then 4 hours\nmax session 6 hours",
    order: 3,
  },
]

const DEFAULT_FAQ = [
  {
    question: "IS IT SAFE TO GET A TATTOO?",
    answer:
      "Tattoos breach the skin, which means that skin infections and other complications are possible, including: allergic reactions, skin infections and other skin problems. From my side I can guarantee that your tattoo will be done by all hygienic standards and if you will follow my tips and look after your fresh tattoo together we can minimize that risk.",
    order: 0,
  },
  {
    question: "HOW TO LOOK AFTER YOU FRESH TATTOO?",
    answer:
      "Stay away from dust, dirt, direct sun rays, pools, saunas etc - especially for the first week after it is done, also first 2-3 days it is very important to wash your fresh tattoo every 4-5 hours with a soft soap, dry it and grease.",
    order: 1,
  },
  {
    question: "RECOMMENDATION BEFORE SESSION?",
    answer:
      "Before session have a good meal, get shower, change your cloth. If you getting late - write a message, if you going to cancel - do it beforehand, let respect each other.",
    order: 2,
  },
  {
    question: "CAN I GET A TATTOO IF I AM UNDER 18?",
    answer:
      "If you are under 18 then you gonna need your parents permission, your mom or dad need to say me personally, that they do not mind you having a tattoo.",
    order: 3,
  },
  {
    question: "DO YOU PROVIDE ANT ANESTHESIA WHILE TATTOOING?",
    answer: "In some cases I do, but you'll need to preorder it.",
    order: 4,
  },
  {
    question: "HOW LONG CAN BE A ONE TATTOO SESSION?",
    answer:
      "Up to 6 hours, in this case we gonna have few brakes. Bring your snacks!))",
    order: 5,
  },
  {
    question: "DO YOU REMOVE TATTOO?",
    answer: "Long story - short - I don't.",
    order: 6,
  },
]

export async function createStudioWithDefaults(
  ownerId: string,
  input: StudioCreationInput,
  tx?: TxClient
) {
  const client = tx ?? prisma

  const existing = await client.studio.findUnique({
    where: { slug: input.slug },
  })
  if (existing) {
    throw new Error(`Slug "${input.slug}" is already taken`)
  }

  const studio = await client.studio.create({
    data: {
      name: input.name.trim(),
      slug: input.slug,
      logo: input.logo ?? null,
      heroImage: "/images/body-bg.jpg",
      heroTextLeft: "Tattoo Artist",
      heroTextCenter: "Your\nStudio",
      heroTextBottom: "Your tagline goes here",
      phone: "+1234567890",
      instagram: "#",
      facebook: "#",
      dpaAcceptedAt: input.dpaAcceptedAt ?? null,
      dpaVersion: input.dpaVersion ?? null,
    },
  })

  await client.studioMembership.create({
    data: {
      userId: ownerId,
      studioId: studio.id,
      role: "OWNER",
    },
  })

  // Pages
  await client.page.createMany({
    data: [
      {
        studioId: studio.id,
        name: "about",
        title: "Hey!! It is me",
        content:
          "gdfgsdfgiusto odio dignissimos ducimus qui blanditiis praesentium volusdgsdgsdgptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat",
        isActive: true,
      },
      {
        studioId: studio.id,
        name: "contacts",
        title: "Get in Touch",
        content:
          "We'd love to hear from you! Whether you have questions about our services or want to book a consultation, don't hesitate to reach out.",
        isActive: true,
      },
    ],
  })

  // Tattoo styles — all defaults with wallpapers
  for (const style of DEFAULT_STYLES) {
    await client.tattooStyle.create({
      data: {
        studioId: studio.id,
        value: style.value,
        description: style.description,
        nonStyle: style.nonStyle,
        wallPaper: style.wallPaper,
      },
    })
  }

  // Services
  for (const service of DEFAULT_SERVICES) {
    await client.service.create({
      data: {
        studioId: studio.id,
        ...service,
      },
    })
  }

  // FAQ
  for (const faq of DEFAULT_FAQ) {
    await client.faqItem.create({
      data: {
        studioId: studio.id,
        ...faq,
      },
    })
  }

  return studio
}
