import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/shared/container"
import { PlatformHeader } from "@/components/shared/platform-header"
import { PlatformFooter } from "@/components/shared/platform-footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How and why Tattooista accesses, collects, stores, uses, and shares your personal information, and the privacy rights you have.",
}

const COMPANY = "Olena Christensen, Individual Entrepreneur (FOP)"

const headingClass =
  "font-display text-[clamp(22px,3vw,28px)] font-normal uppercase tracking-[1px] mt-14 mb-4 scroll-mt-28"
const subheadingClass =
  "text-[13px] tracking-[2px] uppercase text-muted-foreground mt-8 mb-3 scroll-mt-28"
const bodyClass = "text-[15px] leading-[1.8] text-[#c7c7c7] mb-4"
const linkClass =
  "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors break-words"
const listClass = "flex flex-col gap-2 my-4"
const listItemClass =
  "text-[15px] leading-[1.8] text-[#c7c7c7] pl-6 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground"

const bold = "text-foreground font-semibold"

const PRIVACY_EMAIL = "privacy@nothingweird.agency"
const CONTACT_URL = "https://tattooista.app/contact"
const COOKIE_URL = "https://tattooista.app/cookie-policy"

const toc = [
  { id: "infocollect", label: "1. WHAT INFORMATION DO WE COLLECT?" },
  { id: "infouse", label: "2. HOW DO WE PROCESS YOUR INFORMATION?" },
  {
    id: "legalbases",
    label: "3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?",
  },
  {
    id: "whoshare",
    label: "4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
  },
  { id: "3pwebsites", label: "5. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?" },
  { id: "cookies", label: "6. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?" },
  { id: "sociallogins", label: "7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?" },
  { id: "intltransfers", label: "8. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?" },
  { id: "inforetain", label: "9. HOW LONG DO WE KEEP YOUR INFORMATION?" },
  { id: "infosafe", label: "10. HOW DO WE KEEP YOUR INFORMATION SAFE?" },
  { id: "infominors", label: "11. DO WE COLLECT INFORMATION FROM MINORS?" },
  { id: "privacyrights", label: "12. WHAT ARE YOUR PRIVACY RIGHTS?" },
  { id: "DNT", label: "13. CONTROLS FOR DO-NOT-TRACK FEATURES" },
  { id: "uslaws", label: "14. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?" },
  { id: "policyupdates", label: "15. DO WE MAKE UPDATES TO THIS NOTICE?" },
  { id: "contact", label: "16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" },
  {
    id: "request",
    label: "17. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
  },
]

const personalInfoItems = [
  "names",
  "phone numbers",
  "usernames",
  "passwords",
  "contact or authentication data",
]

const legitimateInterests = [
  "Send users information about special offers and discounts on our products and services",
  "Develop and display personalized and relevant advertising content for our users",
  "Analyze how our Services are used so we can improve them to engage and retain users",
  "Support our marketing activities",
  "Diagnose problems and/or prevent fraudulent activities",
  "Understand how our users use our products and services so we can improve user experience",
]

const canadaExceptions = [
  "If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way",
  "For investigations and fraud detection and prevention",
  "For business transactions provided certain conditions are met",
  "If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim",
  "For identifying injured, ill, or deceased persons and communicating with next of kin",
  "If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse",
  "If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province",
  "If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records",
  "If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced",
  "If the collection is solely for journalistic, artistic, or literary purposes",
  "If the information is publicly available and is specified by the regulations",
  "We may disclose de-identified information for approved research or statistics projects, subject to ethics oversight and confidentiality commitments",
]

const thirdParties = [
  "Ad Networks",
  "Cloud Computing Services",
  "Data Analytics Services",
  "Data Storage Service Providers",
  "Payment Processors",
  "User Account Registration & Authentication Services",
  "Website Hosting Service Providers",
  "Communication & Collaboration Tools",
  "Performance Monitoring Tools",
  "Affiliate Marketing Programs",
  "AI Platforms",
  "Social Networks",
  "Finance & Accounting Tools",
  "Government Entities",
  "Product Engineering & Design Tools",
  "Retargeting Platforms",
  "Sales & Marketing Tools",
  "Testing Tools",
]

const usCategories = [
  {
    cat: "A. Identifiers",
    examples:
      "Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name",
    collected: "YES",
  },
  {
    cat: "B. Personal information as defined in the California Customer Records statute",
    examples:
      "Name, contact information, education, employment, employment history, and financial information",
    collected: "YES",
  },
  {
    cat: "C. Protected classification characteristics under state or federal law",
    examples:
      "Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data",
    collected: "YES",
  },
  {
    cat: "D. Commercial information",
    examples:
      "Transaction information, purchase history, financial details, and payment information",
    collected: "YES",
  },
  {
    cat: "E. Biometric information",
    examples: "Fingerprints and voiceprints",
    collected: "NO",
  },
  {
    cat: "F. Internet or other similar network activity",
    examples:
      "Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements",
    collected: "YES",
  },
  {
    cat: "G. Geolocation data",
    examples: "Device location",
    collected: "YES",
  },
  {
    cat: "H. Audio, electronic, sensory, or similar information",
    examples:
      "Images and audio, video or call recordings created in connection with our business activities",
    collected: "YES",
  },
  {
    cat: "I. Professional or employment-related information",
    examples:
      "Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us",
    collected: "YES",
  },
  {
    cat: "J. Education Information",
    examples: "Student records and directory information",
    collected: "NO",
  },
  {
    cat: "K. Inferences drawn from collected personal information",
    examples:
      "Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual's preferences and characteristics",
    collected: "YES",
  },
  {
    cat: "L. Sensitive personal Information",
    examples:
      "Account login information, contents of email or text messages and financial information including account access details",
    collected: "YES",
  },
]

const retentionCategories = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category F",
  "Category G",
  "Category H",
  "Category I",
  "Category K",
  "Category L",
]

const disclosedCategories = [
  "Category A. Identifiers",
  "Category B. Personal information as defined in the California Customer Records law",
  "Category C. Characteristics of protected classifications under state or federal law",
  "Category D. Commercial information",
  "Category F. Internet or other electronic network activity information",
  "Category G. Geolocation data",
  "Category H. Audio, electronic, visual, and similar information",
  "Category I. Professional or employment-related information",
  "Category K. Inferences drawn from collected personal information",
  "Category L. Sensitive personal information",
]

const yourRights = [
  ["Right to know", "whether or not we are processing your personal data"],
  ["Right to access", "your personal data"],
  ["Right to correct", "inaccuracies in your personal data"],
  ["Right to request", "the deletion of your personal data"],
  ["Right to obtain a copy", "of the personal data you previously shared with us"],
  ["Right to non-discrimination", "for exercising your rights"],
  [
    "Right to opt out",
    "of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (“profiling”)",
  ],
]

const additionalRights = [
  "Right to access the categories of personal data being processed (as permitted by applicable law, including the privacy law in Minnesota)",
  "Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in California, Delaware, and Maryland)",
  "Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in Minnesota and Oregon)",
  "Right to obtain a list of third parties to which we have sold personal data (as permitted by applicable law, including the privacy law in Connecticut)",
  "Right to review, understand, question, and depending on where you live, correct how personal data has been profiled (as permitted by applicable law, including the privacy law in Connecticut and Minnesota)",
  "Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including the privacy law in California)",
  "Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including the privacy law in Florida)",
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader />
      <Container className="max-w-[860px] pt-[120px] pb-16 min-[990px]:pt-[140px] min-[990px]:pb-[100px]">
        <Link
          href="/"
          className="inline-block text-[13px] tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>

        <h1 className="font-display text-[clamp(32px,5vw,55px)] font-normal uppercase tracking-[2px] mt-8">
          Privacy Policy
        </h1>
        <p className="text-[13px] tracking-[1.5px] uppercase text-muted-foreground mt-4">
          Last updated June 07, 2026
        </p>

        <div className="mt-12">
          <p className={bodyClass}>
            This Privacy Notice for {COMPANY} (doing business as{" "}
            <strong className={bold}>Tattooista</strong>) (&ldquo;
            <strong className={bold}>we</strong>,&rdquo; &ldquo;
            <strong className={bold}>us</strong>,&rdquo; or &ldquo;
            <strong className={bold}>our</strong>&rdquo;), describes how and why we might
            access, collect, store, use, and/or share (&ldquo;
            <strong className={bold}>process</strong>&rdquo;) your personal information
            when you use our services (&ldquo;<strong className={bold}>Services</strong>
            &rdquo;), including when you:
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              Visit our website at{" "}
              <a
                href="https://tattooista.app"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                https://tattooista.app
              </a>{" "}
              or any website of ours that links to this Privacy Notice
            </li>
            <li className={listItemClass}>
              Use Tattooista. Tattooista is a software-as-a-service platform that lets
              tattoo studios create a branded website, showcase their portfolio, and
              manage client bookings. Studios subscribe to the service; their clients book
              appointments through the studio&rsquo;s site.
            </li>
            <li className={listItemClass}>
              Engage with us in other related ways, including any marketing or events
            </li>
          </ul>
          <p className={bodyClass}>
            <strong className={bold}>Questions or concerns?</strong> Reading this Privacy
            Notice will help you understand your privacy rights and choices. We are
            responsible for making decisions about how your personal information is
            processed. If you do not agree with our policies and practices, please do not
            use our Services. If you still have any questions or concerns, please contact
            us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            .
          </p>

          <h2 className={headingClass}>Summary of Key Points</h2>
          <p className={bodyClass}>
            <em>
              <strong>
                This summary provides key points from our Privacy Notice, but you can find
                out more details about any of these topics by clicking the link following
                each key point or by using our{" "}
              </strong>
            </em>
            <a href="#toc" className={linkClass}>
              <em>
                <strong>table of contents</strong>
              </em>
            </a>
            <em>
              <strong> below to find the section you are looking for.</strong>
            </em>
          </p>
          <p className={bodyClass}>
            <strong className={bold}>What personal information do we process?</strong> When
            you visit, use, or navigate our Services, we may process personal information
            depending on how you interact with us and the Services, the choices you make,
            and the products and features you use. Learn more about{" "}
            <a href="#personalinfo" className={linkClass}>
              personal information you disclose to us
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              Do we process any sensitive personal information?
            </strong>{" "}
            Some of the information may be considered &ldquo;special&rdquo; or
            &ldquo;sensitive&rdquo; in certain jurisdictions, for example your racial or
            ethnic origins, sexual orientation, and religious beliefs. We may process
            sensitive personal information when necessary with your consent or as otherwise
            permitted by applicable law. Learn more about{" "}
            <a href="#sensitiveinfo" className={linkClass}>
              sensitive information we process
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              Do we collect any information from third parties?
            </strong>{" "}
            We do not collect any information from third parties.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>How do we process your information?</strong> We
            process your information to provide, improve, and administer our Services,
            communicate with you, for security and fraud prevention, and to comply with
            law. We may also process your information for other purposes with your consent.
            We process your information only when we have a valid legal reason to do so.
            Learn more about{" "}
            <a href="#infouse" className={linkClass}>
              how we process your information
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              In what situations and with which types of parties do we share personal
              information?
            </strong>{" "}
            We may share information in specific situations and with specific categories of
            third parties. Learn more about{" "}
            <a href="#whoshare" className={linkClass}>
              when and with whom we share your personal information
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>How do we keep your information safe?</strong> We have
            adequate organizational and technical processes and procedures in place to
            protect your personal information. However, no electronic transmission over the
            internet or information storage technology can be guaranteed to be 100% secure,
            so we cannot promise or guarantee that hackers, cybercriminals, or other
            unauthorized third parties will not be able to defeat our security and
            improperly collect, access, steal, or modify your information. Learn more about{" "}
            <a href="#infosafe" className={linkClass}>
              how we keep your information safe
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>What are your rights?</strong> Depending on where you
            are located geographically, the applicable privacy law may mean you have
            certain rights regarding your personal information. Learn more about{" "}
            <a href="#privacyrights" className={linkClass}>
              your privacy rights
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>How do you exercise your rights?</strong> The easiest
            way to exercise your rights is by visiting{" "}
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {CONTACT_URL}
            </a>
            , or by contacting us. We will consider and act upon any request in accordance
            with applicable data protection laws.
          </p>
          <p className={bodyClass}>
            Want to learn more about what we do with any information we collect?{" "}
            <a href="#toc" className={linkClass}>
              Review the Privacy Notice in full
            </a>
            .
          </p>

          <h2 id="toc" className={headingClass}>
            Table of Contents
          </h2>
          <ul className={listClass}>
            {toc.map((item) => (
              <li key={item.id} className={listItemClass}>
                <a href={`#${item.id}`} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <h2 id="infocollect" className={headingClass}>
            1. What Information Do We Collect?
          </h2>
          <h3 id="personalinfo" className={subheadingClass}>
            Personal information you disclose to us
          </h3>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We collect personal information that you provide
              to us.
            </em>
          </p>
          <p className={bodyClass}>
            We collect personal information that you voluntarily provide to us when you
            register on the Services, express an interest in obtaining information about us
            or our products and Services, when you participate in activities on the
            Services, or otherwise when you contact us.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>Personal Information Provided by You.</strong> The
            personal information that we collect depends on the context of your
            interactions with us and the Services, the choices you make, and the products
            and features you use. The personal information we collect may include the
            following:
          </p>
          <ul className={listClass}>
            {personalInfoItems.map((item) => (
              <li key={item} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
          <p className={bodyClass} id="sensitiveinfo">
            <strong className={bold}>Sensitive Information.</strong> When necessary, with
            your consent or as otherwise permitted by applicable law, we process the
            following categories of sensitive information.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>Payment Data.</strong> We may collect data necessary
            to process your payment if you choose to make purchases, such as your payment
            instrument number, and the security code associated with your payment
            instrument. All payment data is handled and stored by Paddle. You may find
            their privacy notice link(s) here:{" "}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://www.paddle.com/legal/privacy
            </a>
            .
          </p>
          <p className={bodyClass}>
            <strong className={bold}>Social Media Login Data.</strong> We may provide you
            with the option to register with us using your existing social media account
            details, like your Facebook, X, or other social media account. If you choose to
            register in this way, we will collect certain profile information about you from
            the social media provider, as described in the section called{" "}
            <a href="#sociallogins" className={linkClass}>
              HOW DO WE HANDLE YOUR SOCIAL LOGINS?
            </a>{" "}
            below.
          </p>
          <p className={bodyClass}>
            All personal information that you provide to us must be true, complete, and
            accurate, and you must notify us of any changes to such personal information.
          </p>
          <h3 className={subheadingClass}>Information automatically collected</h3>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> Some information — such as your Internet Protocol
              (IP) address and/or browser and device characteristics — is collected
              automatically when you visit our Services.
            </em>
          </p>
          <p className={bodyClass}>
            We automatically collect certain information when you visit, use, or navigate
            the Services. This information does not reveal your specific identity (like your
            name or contact information) but may include device and usage information, such
            as your IP address, browser and device characteristics, operating system,
            language preferences, referring URLs, device name, country, location,
            information about how and when you use our Services, and other technical
            information. This information is primarily needed to maintain the security and
            operation of our Services, and for our internal analytics and reporting
            purposes.
          </p>
          <p className={bodyClass}>
            Like many businesses, we also collect information through cookies and similar
            technologies. You can find out more about this in our Cookie Notice:{" "}
            <a
              href={COOKIE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {COOKIE_URL}
            </a>
            .
          </p>
          <p className={bodyClass}>The information we collect includes:</p>
          <ul className={listClass}>
            <li className={listItemClass}>
              <em>Log and Usage Data.</em> Log and usage data is service-related,
              diagnostic, usage, and performance information our servers automatically
              collect when you access or use our Services and which we record in log files.
              Depending on how you interact with us, this log data may include your IP
              address, device information, browser type, and settings and information about
              your activity in the Services (such as the date/time stamps associated with
              your usage, pages and files viewed, searches, and other actions you take such
              as which features you use), device event information (such as system activity,
              error reports (sometimes called &ldquo;crash dumps&rdquo;), and hardware
              settings).
            </li>
            <li className={listItemClass}>
              <em>Device Data.</em> We collect device data such as information about your
              computer, phone, tablet, or other device you use to access the Services.
              Depending on the device used, this device data may include information such as
              your IP address (or proxy server), device and application identification
              numbers, location, browser type, hardware model, Internet service provider
              and/or mobile carrier, operating system, and system configuration
              information.
            </li>
          </ul>
          <h3 className={subheadingClass}>Google API</h3>
          <p className={bodyClass}>
            Our use of information received from Google APIs will adhere to{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Google API Services User Data Policy
            </a>
            , including the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Limited Use requirements
            </a>
            .
          </p>

          <h2 id="infouse" className={headingClass}>
            2. How Do We Process Your Information?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We process your information to provide, improve,
              and administer our Services, communicate with you, for security and fraud
              prevention, and to comply with law. We process the personal information for
              the following purposes listed below. We may also process your information for
              other purposes only with your prior explicit consent.
            </em>
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              We process your personal information for a variety of reasons, depending on
              how you interact with our Services, including:
            </strong>
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              <strong className={bold}>
                To facilitate account creation and authentication and otherwise manage user
                accounts.
              </strong>{" "}
              We may process your information so you can create and log in to your account,
              as well as keep your account in working order.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>
                To deliver and facilitate delivery of services to the user.
              </strong>{" "}
              We may process your information to provide you with the requested service.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>
                To respond to user inquiries/offer support to users.
              </strong>{" "}
              We may process your information to respond to your inquiries and solve any
              potential issues you might have with the requested service.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To send administrative information to you.</strong>{" "}
              We may process your information to send you details about our products and
              services, changes to our terms and policies, and other similar information.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To fulfill and manage your orders.</strong> We may
              process your information to fulfill and manage your orders, payments, returns,
              and exchanges made through the Services.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To request feedback.</strong> We may process your
              information when necessary to request feedback and to contact you about your
              use of our Services.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>
                To send you marketing and promotional communications.
              </strong>{" "}
              We may process the personal information you send to us for our marketing
              purposes, if this is in accordance with your marketing preferences. You can
              opt out of our marketing emails at any time. For more information, see{" "}
              <a href="#privacyrights" className={linkClass}>
                WHAT ARE YOUR PRIVACY RIGHTS?
              </a>{" "}
              below.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To deliver targeted advertising to you.</strong> We
              may process your information to develop and display personalized content and
              advertising tailored to your interests, location, and more. For more
              information see our Cookie Notice:{" "}
              <a
                href={COOKIE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {COOKIE_URL}
              </a>
              .
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To protect our Services.</strong> We may process
              your information as part of our efforts to keep our Services safe and secure,
              including fraud monitoring and prevention.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>To identify usage trends.</strong> We may process
              information about how you use our Services to better understand how they are
              being used so we can improve them.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>
                To determine the effectiveness of our marketing and promotional campaigns.
              </strong>{" "}
              We may process your information to better understand how to provide marketing
              and promotional campaigns that are most relevant to you.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>
                To save or protect an individual&rsquo;s vital interest.
              </strong>{" "}
              We may process your information when necessary to save or protect an
              individual&rsquo;s vital interest, such as to prevent harm.
            </li>
          </ul>

          <h2 id="legalbases" className={headingClass}>
            3. What Legal Bases Do We Rely On To Process Your Information?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We only process your personal information when we
              believe it is necessary and we have a valid legal reason (i.e., legal basis)
              to do so under applicable law, like with your consent, to comply with laws, to
              provide you with services to enter into or fulfill our contractual
              obligations, to protect your rights, or to fulfill our legitimate business
              interests.
            </em>
          </p>
          <p className={bodyClass}>
            <em>
              <strong>
                <u>If you are located in the EU or UK, this section applies to you.</u>
              </strong>
            </em>
          </p>
          <p className={bodyClass}>
            The General Data Protection Regulation (GDPR) and UK GDPR require us to explain
            the valid legal bases we rely on in order to process your personal information.
            As such, we may rely on the following legal bases to process your personal
            information:
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              <strong className={bold}>Consent.</strong> We may process your information if
              you have given us permission (i.e., consent) to use your personal information
              for a specific purpose. You can withdraw your consent at any time. Learn more
              about{" "}
              <a href="#withdrawconsent" className={linkClass}>
                withdrawing your consent
              </a>
              .
            </li>
            <li className={listItemClass}>
              <strong className={bold}>Performance of a Contract.</strong> We may process
              your personal information when we believe it is necessary to fulfill our
              contractual obligations to you, including providing our Services or at your
              request prior to entering into a contract with you.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>Legitimate Interests.</strong> We may process your
              information when we believe it is reasonably necessary to achieve our
              legitimate business interests and those interests do not outweigh your
              interests and fundamental rights and freedoms. For example, we may process
              your personal information for some of the purposes described in order to:
            </li>
          </ul>
          <ul className={`${listClass} ml-8`}>
            {legitimateInterests.map((item) => (
              <li key={item} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
          <ul className={listClass}>
            <li className={listItemClass}>
              <strong className={bold}>Legal Obligations.</strong> We may process your
              information where we believe it is necessary for compliance with our legal
              obligations, such as to cooperate with a law enforcement body or regulatory
              agency, exercise or defend our legal rights, or disclose your information as
              evidence in litigation in which we are involved.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>Vital Interests.</strong> We may process your
              information where we believe it is necessary to protect your vital interests
              or the vital interests of a third party, such as situations involving
              potential threats to the safety of any person.
            </li>
          </ul>
          <p className={bodyClass}>
            <em>
              <strong>
                <u>If you are located in Canada, this section applies to you.</u>
              </strong>
            </em>
          </p>
          <p className={bodyClass}>
            We may process your information if you have given us specific permission (i.e.,
            express consent) to use your personal information for a specific purpose, or in
            situations where your permission can be inferred (i.e., implied consent). You
            can{" "}
            <a href="#withdrawconsent" className={linkClass}>
              withdraw your consent
            </a>{" "}
            at any time.
          </p>
          <p className={bodyClass}>
            In some exceptional cases, we may be legally permitted under applicable law to
            process your information without your consent, including, for example:
          </p>
          <ul className={listClass}>
            {canadaExceptions.map((item) => (
              <li key={item} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>

          <h2 id="whoshare" className={headingClass}>
            4. When And With Whom Do We Share Your Personal Information?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We may share information in specific situations
              described in this section and/or with the following categories of third
              parties.
            </em>
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              Vendors, Consultants, and Other Third-Party Service Providers.
            </strong>{" "}
            We may share your data with third-party vendors, service providers, contractors,
            or agents (&ldquo;<strong className={bold}>third parties</strong>&rdquo;) who
            perform services for us or on our behalf and require access to such information
            to do that work. We have contracts in place with our third parties, which are
            designed to help safeguard your personal information. This means that they
            cannot do anything with your personal information unless we have instructed them
            to do it. They will also not share your personal information with any
            organization apart from us. They also commit to protect the data they hold on
            our behalf and to retain it for the period we instruct.
          </p>
          <p className={bodyClass}>
            The categories of third parties we may share personal information with are as
            follows:
          </p>
          <ul className={listClass}>
            {thirdParties.map((item) => (
              <li key={item} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
          <p className={bodyClass}>
            We also may need to share your personal information in the following situations:
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              <strong className={bold}>Business Transfers.</strong> We may share or transfer
              your information in connection with, or during negotiations of, any merger,
              sale of company assets, financing, or acquisition of all or a portion of our
              business to another company.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>When we use Google Maps Platform APIs.</strong> We
              may share your information with certain Google Maps Platform APIs (e.g.,
              Google Maps API, Places API). Google Maps uses GPS, Wi-Fi, and cell towers to
              estimate your location. GPS is accurate to about 20 meters, while Wi-Fi and
              cell towers help improve accuracy when GPS signals are weak, like indoors.
              This data helps Google Maps provide directions, but it is not always perfectly
              precise.
            </li>
            <li className={listItemClass}>
              <strong className={bold}>Business Partners.</strong> We may share your
              information with our business partners to offer you certain products,
              services, or promotions.
            </li>
          </ul>

          <h2 id="3pwebsites" className={headingClass}>
            5. What Is Our Stance On Third-Party Websites?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We are not responsible for the safety of any
              information that you share with third parties that we may link to or who
              advertise on our Services, but are not affiliated with, our Services.
            </em>
          </p>
          <p className={bodyClass}>
            The Services may link to third-party websites, online services, or mobile
            applications and/or contain advertisements from third parties that are not
            affiliated with us and which may link to other websites, services, or
            applications. Accordingly, we do not make any guarantee regarding any such third
            parties, and we will not be liable for any loss or damage caused by the use of
            such third-party websites, services, or applications. The inclusion of a link
            towards a third-party website, service, or application does not imply an
            endorsement by us. We cannot guarantee the safety and privacy of data you
            provide to any third-party websites. Any data collected by third parties is not
            covered by this Privacy Notice. We are not responsible for the content or
            privacy and security practices and policies of any third parties, including
            other websites, services, or applications that may be linked to or from the
            Services. You should review the policies of such third parties and contact them
            directly to respond to your questions.
          </p>

          <h2 id="cookies" className={headingClass}>
            6. Do We Use Cookies And Other Tracking Technologies?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We may use cookies and other tracking technologies
              to collect and store your information.
            </em>
          </p>
          <p className={bodyClass}>
            We may use cookies and similar tracking technologies (like web beacons and
            pixels) to gather information when you interact with our Services. Some online
            tracking technologies help us maintain the security of our Services and your
            account, prevent crashes, fix bugs, save your preferences, and assist with basic
            site functions.
          </p>
          <p className={bodyClass}>
            We also permit third parties and service providers to use online tracking
            technologies on our Services for analytics and advertising, including to help
            manage and display advertisements, to tailor advertisements to your interests,
            or to send abandoned shopping cart reminders (depending on your communication
            preferences). The third parties and service providers use their technology to
            provide advertising about products and services tailored to your interests which
            may appear either on our Services or on other websites.
          </p>
          <p className={bodyClass}>
            To the extent these online tracking technologies are deemed to be a
            &ldquo;sale&rdquo;/&ldquo;sharing&rdquo; (which includes targeted advertising,
            as defined under the applicable laws) under applicable US state laws, you can
            opt out of these online tracking technologies by submitting a request as
            described below under section{" "}
            <a href="#uslaws" className={linkClass}>
              DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
            </a>
          </p>
          <p className={bodyClass}>
            Specific information about how we use such technologies and how you can refuse
            certain cookies is set out in our Cookie Notice:{" "}
            <a
              href={COOKIE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {COOKIE_URL}
            </a>
            .
          </p>
          <h3 className={subheadingClass}>Google Analytics</h3>
          <p className={bodyClass}>
            We may share your information with Google Analytics to track and analyze the use
            of the Services. The Google Analytics Advertising Features that we may use
            include: Remarketing with Google Analytics, Google Display Network Impressions
            Reporting and Google Analytics Demographics and Interests Reporting. To opt out
            of being tracked by Google Analytics across the Services, visit{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://tools.google.com/dlpage/gaoptout
            </a>
            . You can opt out of Google Analytics Advertising Features through{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Ads Settings
            </a>{" "}
            and Ad Settings for mobile apps. Other opt out means include{" "}
            <a
              href="http://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              http://optout.networkadvertising.org/
            </a>{" "}
            and{" "}
            <a
              href="http://www.networkadvertising.org/mobile-choice"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              http://www.networkadvertising.org/mobile-choice
            </a>
            . For more information on the privacy practices of Google, please visit the{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Google Privacy & Terms page
            </a>
            .
          </p>

          <h2 id="sociallogins" className={headingClass}>
            7. How Do We Handle Your Social Logins?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> If you choose to register or log in to our Services
              using a social media account, we may have access to certain information about
              you.
            </em>
          </p>
          <p className={bodyClass}>
            Our Services offer you the ability to register and log in using your third-party
            social media account details (like your Facebook or X logins). Where you choose
            to do this, we will receive certain profile information about you from your
            social media provider. The profile information we receive may vary depending on
            the social media provider concerned, but will often include your name, email
            address, friends list, and profile picture, as well as other information you
            choose to make public on such a social media platform.
          </p>
          <p className={bodyClass}>
            We will use the information we receive only for the purposes that are described
            in this Privacy Notice or that are otherwise made clear to you on the relevant
            Services. Please note that we do not control, and are not responsible for, other
            uses of your personal information by your third-party social media provider. We
            recommend that you review their privacy notice to understand how they collect,
            use, and share your personal information, and how you can set your privacy
            preferences on their sites and apps.
          </p>

          <h2 id="intltransfers" className={headingClass}>
            8. Is Your Information Transferred Internationally?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We may transfer, store, and process your
              information in countries other than your own.
            </em>
          </p>
          <p className={bodyClass}>
            Our servers are located in the United States and Germany. Regardless of your
            location, please be aware that your information may be transferred to, stored by,
            and processed by us in our facilities and in the facilities of the third parties
            with whom we may share your personal information (see{" "}
            <a href="#whoshare" className={linkClass}>
              WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </a>{" "}
            above), including facilities in the United States, United Kingdom, Ireland, and
            other countries.
          </p>
          <p className={bodyClass}>
            If you are a resident in the European Economic Area (EEA), United Kingdom (UK),
            or Switzerland, then these countries may not necessarily have data protection
            laws or other similar laws as comprehensive as those in your country. However,
            we will take all necessary measures to protect your personal information in
            accordance with this Privacy Notice and applicable law.
          </p>
          <p className={bodyClass}>European Commission&rsquo;s Standard Contractual Clauses:</p>
          <p className={bodyClass}>
            We have implemented measures to protect your personal information, including by
            using the European Commission&rsquo;s Standard Contractual Clauses for transfers
            of personal information between our group companies and between us and our
            third-party providers. These clauses require all recipients to protect all
            personal information that they process originating from the EEA or UK in
            accordance with European data protection laws and regulations. Our Standard
            Contractual Clauses can be provided upon request. We have implemented similar
            appropriate safeguards with our third-party service providers and partners and
            further details can be provided upon request.
          </p>

          <h2 id="inforetain" className={headingClass}>
            9. How Long Do We Keep Your Information?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We keep your information for as long as necessary
              to fulfill the purposes outlined in this Privacy Notice unless otherwise
              required by law.
            </em>
          </p>
          <p className={bodyClass}>
            We will only keep your personal information for as long as it is necessary for
            the purposes set out in this Privacy Notice, unless a longer retention period is
            required or permitted by law (such as tax, accounting, or other legal
            requirements). No purpose in this notice will require us keeping your personal
            information for longer than the period of time in which users have an account
            with us.
          </p>
          <p className={bodyClass}>
            When we have no ongoing legitimate business need to process your personal
            information, we will either delete or anonymize such information, or, if this is
            not possible (for example, because your personal information has been stored in
            backup archives), then we will securely store your personal information and
            isolate it from any further processing until deletion is possible.
          </p>

          <h2 id="infosafe" className={headingClass}>
            10. How Do We Keep Your Information Safe?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We aim to protect your personal information through
              a system of organizational and technical security measures.
            </em>
          </p>
          <p className={bodyClass}>
            We have implemented appropriate and reasonable technical and organizational
            security measures designed to protect the security of any personal information
            we process. However, despite our safeguards and efforts to secure your
            information, no electronic transmission over the Internet or information storage
            technology can be guaranteed to be 100% secure, so we cannot promise or
            guarantee that hackers, cybercriminals, or other unauthorized third parties will
            not be able to defeat our security and improperly collect, access, steal, or
            modify your information. Although we will do our best to protect your personal
            information, transmission of personal information to and from our Services is at
            your own risk. You should only access the Services within a secure environment.
          </p>

          <h2 id="infominors" className={headingClass}>
            11. Do We Collect Information From Minors?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> We do not knowingly collect data from or market to
              children under 18 years of age or the equivalent age as specified by law in
              your jurisdiction.
            </em>
          </p>
          <p className={bodyClass}>
            We do not knowingly collect, solicit data from, or market to children under 18
            years of age or the equivalent age as specified by law in your jurisdiction, nor
            do we knowingly sell such personal information. By using the Services, you
            represent that you are at least 18 or the equivalent age as specified by law in
            your jurisdiction or that you are the parent or guardian of such a minor and
            consent to such minor dependent&rsquo;s use of the Services. If we learn that
            personal information from users less than 18 years of age or the equivalent age
            as specified by law in your jurisdiction has been collected, we will deactivate
            the account and take reasonable measures to promptly delete such data from our
            records. If you become aware of any data we may have collected from children
            under age 18 or the equivalent age as specified by law in your jurisdiction,
            please contact us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            .
          </p>

          <h2 id="privacyrights" className={headingClass}>
            12. What Are Your Privacy Rights?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> Depending on your state of residence in the US or
              in some regions, such as the European Economic Area (EEA), United Kingdom
              (UK), Switzerland, and Canada, you have rights that allow you greater access
              to and control over your personal information. You may review, change, or
              terminate your account at any time, depending on your country, province, or
              state of residence.
            </em>
          </p>
          <p className={bodyClass}>
            In some regions (like the EEA, UK, Switzerland, and Canada), you have certain
            rights under applicable data protection laws. These may include the right (i) to
            request access and obtain a copy of your personal information, (ii) to request
            rectification or erasure; (iii) to restrict the processing of your personal
            information; (iv) if applicable, to data portability; and (v) not to be subject
            to automated decision-making. If a decision that produces legal or similarly
            significant effects is made solely by automated means, we will inform you,
            explain the main factors, and offer a simple way to request human review. In
            certain circumstances, you may also have the right to object to the processing of
            your personal information. You can make such a request by contacting us by using
            the contact details provided in the section{" "}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>{" "}
            below.
          </p>
          <p className={bodyClass}>
            We will consider and act upon any request in accordance with applicable data
            protection laws.
          </p>
          <p className={bodyClass}>
            If you are located in the EEA or UK and you believe we are unlawfully processing
            your personal information, you also have the right to complain to your{" "}
            <a
              href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Member State data protection authority
            </a>{" "}
            or{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              UK data protection authority
            </a>
            .
          </p>
          <p className={bodyClass}>
            If you are located in Switzerland, you may contact the{" "}
            <a
              href="https://www.edoeb.admin.ch/edoeb/en/home.html"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Federal Data Protection and Information Commissioner
            </a>
            .
          </p>
          <p className={bodyClass} id="withdrawconsent">
            <strong className={bold}>
              <u>Withdrawing your consent:</u>
            </strong>{" "}
            If we are relying on your consent to process your personal information, which may
            be express and/or implied consent depending on the applicable law, you have the
            right to withdraw your consent at any time. You can withdraw your consent at any
            time by contacting us by using the contact details provided in the section{" "}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>{" "}
            below or updating your preferences.
          </p>
          <p className={bodyClass}>
            However, please note that this will not affect the lawfulness of the processing
            before its withdrawal nor, when applicable law allows, will it affect the
            processing of your personal information conducted in reliance on lawful
            processing grounds other than consent.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              <u>Opting out of marketing and promotional communications:</u>
            </strong>{" "}
            You can unsubscribe from our marketing and promotional communications at any time
            by clicking on the unsubscribe link in the emails that we send, or by contacting
            us using the details provided in the section{" "}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>{" "}
            below. You will then be removed from the marketing lists. However, we may still
            communicate with you — for example, to send you service-related messages that
            are necessary for the administration and use of your account, to respond to
            service requests, or for other non-marketing purposes.
          </p>
          <h3 className={subheadingClass}>Account Information</h3>
          <p className={bodyClass}>
            If you would at any time like to review or change the information in your account
            or terminate your account, you can:
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              Log in to your account settings and update your user account.
            </li>
          </ul>
          <p className={bodyClass}>
            Upon your request to terminate your account, we will deactivate or delete your
            account and information from our active databases. However, we may retain some
            information in our files to prevent fraud, troubleshoot problems, assist with any
            investigations, enforce our legal terms and/or comply with applicable legal
            requirements.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              <u>Cookies and similar technologies:</u>
            </strong>{" "}
            Most Web browsers are set to accept cookies by default. If you prefer, you can
            usually choose to set your browser to remove cookies and to reject cookies. If
            you choose to remove cookies or reject cookies, this could affect certain
            features or services of our Services. You may also{" "}
            <a
              href="http://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              opt out of interest-based advertising by advertisers
            </a>{" "}
            on our Services. For further information, please see our Cookie Notice:{" "}
            <a
              href={COOKIE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {COOKIE_URL}
            </a>
            .
          </p>
          <p className={bodyClass}>
            If you have questions or comments about your privacy rights, you may email us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            .
          </p>

          <h2 id="DNT" className={headingClass}>
            13. Controls For Do-Not-Track Features
          </h2>
          <p className={bodyClass}>
            Most web browsers and some mobile operating systems and mobile applications
            include a Do-Not-Track (&ldquo;DNT&rdquo;) feature or setting you can activate to
            signal your privacy preference not to have data about your online browsing
            activities monitored and collected. At this stage, no uniform technology
            standard for recognizing and implementing DNT signals has been finalized. As
            such, we do not currently respond to DNT browser signals or any other mechanism
            that automatically communicates your choice not to be tracked online. If a
            standard for online tracking is adopted that we must follow in the future, we
            will inform you about that practice in a revised version of this Privacy Notice.
          </p>
          <p className={bodyClass}>
            California law requires us to let you know how we respond to web browser DNT
            signals. Because there currently is not an industry or legal standard for
            recognizing or honoring DNT signals, we do not respond to them at this time.
          </p>
          <p className={bodyClass}>
            <strong className={bold}>
              <u>Global Privacy Control:</u>
            </strong>{" "}
            We recognize and honor Global Privacy Control (GPC) signals. If you use a browser
            or extension that supports GPC, we will treat this as a valid request to opt out
            of the sale or sharing of your personal information for targeted advertising
            purposes under applicable state privacy laws, including the California Consumer
            Privacy Act (CCPA). When we detect a GPC signal from your browser, we will
            automatically apply your opt-out preference without requiring you to take any
            additional action. For more information about GPC and how to enable it, visit{" "}
            <a
              href="http://globalprivacycontrol.org"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              globalprivacycontrol.org
            </a>
            .
          </p>

          <h2 id="uslaws" className={headingClass}>
            14. Do United States Residents Have Specific Privacy Rights?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> If you are a resident of California, Colorado,
              Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota,
              Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee,
              Texas, Utah, or Virginia, you may have the right to request access to and
              receive details about the personal information we maintain about you and how we
              have processed it, correct inaccuracies, get a copy of, or delete your personal
              information. You may also have the right to withdraw your consent to our
              processing of your personal information. These rights may be limited in some
              circumstances by applicable law. More information is provided below.
            </em>
          </p>
          <h3 className={subheadingClass}>Categories of Personal Information We Collect</h3>
          <p className={bodyClass}>
            The table below shows the categories of personal information we have collected in
            the past twelve (12) months. The table includes illustrative examples of each
            category and does not reflect the personal information we collect from you. For a
            comprehensive inventory of all personal information we process, please refer to
            the section{" "}
            <a href="#infocollect" className={linkClass}>
              WHAT INFORMATION DO WE COLLECT?
            </a>
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-[14px] leading-[1.6] text-[#c7c7c7]">
              <thead>
                <tr>
                  <th className="border border-border p-3 text-left align-top font-semibold text-foreground">
                    Category
                  </th>
                  <th className="border border-border p-3 text-left align-top font-semibold text-foreground">
                    Examples
                  </th>
                  <th className="border border-border p-3 text-center align-top font-semibold text-foreground">
                    Collected
                  </th>
                </tr>
              </thead>
              <tbody>
                {usCategories.map((row) => (
                  <tr key={row.cat}>
                    <td className="border border-border p-3 align-top">{row.cat}</td>
                    <td className="border border-border p-3 align-top">{row.examples}</td>
                    <td className="border border-border p-3 text-center align-middle">
                      {row.collected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={bodyClass}>
            We only collect sensitive personal information, as defined by applicable privacy
            laws or the purposes allowed by law or with your consent. Sensitive personal
            information may be used, or disclosed to a service provider or contractor, for
            additional, specified purposes. You may have the right to limit the use or
            disclosure of your sensitive personal information. We do not collect or process
            sensitive personal information for the purpose of inferring characteristics about
            you.
          </p>
          <p className={bodyClass}>
            We may also collect other personal information outside of these categories
            through instances where you interact with us in person, online, or by phone or
            mail in the context of:
          </p>
          <ul className={listClass}>
            <li className={listItemClass}>
              Receiving help through our customer support channels;
            </li>
            <li className={listItemClass}>
              Participation in customer surveys or contests; and
            </li>
            <li className={listItemClass}>
              Facilitation in the delivery of our Services and to respond to your inquiries.
            </li>
          </ul>
          <p className={bodyClass}>
            We will use and retain the collected personal information as needed to provide
            the Services or for:
          </p>
          <ul className={listClass}>
            {retentionCategories.map((cat) => (
              <li key={cat} className={listItemClass}>
                {cat} - As long as the user has an account with us
              </li>
            ))}
          </ul>
          <h3 className={subheadingClass}>Sources of Personal Information</h3>
          <p className={bodyClass}>
            Learn more about the sources of personal information we collect in{" "}
            <a href="#infocollect" className={linkClass}>
              WHAT INFORMATION DO WE COLLECT?
            </a>
          </p>
          <h3 className={subheadingClass}>How We Use and Share Personal Information</h3>
          <p className={bodyClass}>
            Learn more about how we use your personal information in the section,{" "}
            <a href="#infouse" className={linkClass}>
              HOW DO WE PROCESS YOUR INFORMATION?
            </a>
          </p>
          <p className={bodyClass}>We collect and share your personal information through:</p>
          <ul className={listClass}>
            <li className={listItemClass}>Targeting cookies/Marketing cookies</li>
            <li className={listItemClass}>Social media cookies</li>
            <li className={listItemClass}>Beacons/Pixels/Tags</li>
            <li className={listItemClass}>Click redirects: affiliate/click-redirect.</li>
            <li className={listItemClass}>
              Social media plugins: Instagram, Facebook, TikTok, Pinterest, YouTube and X /
              Twitter. We use social media features, such as a &ldquo;Like&rdquo; button, and
              widgets, such as a &ldquo;Share&rdquo; button, in our Services. Such features
              may process your Internet Protocol (IP) address and track which page you are
              visiting on our website. We may place a cookie to enable the feature to work
              correctly. If you are logged in on a certain social media platform and you
              interact with a widget or button belonging to that social media platform, this
              information may be recorded to your profile of such social media platform. To
              avoid this, you should log out from that social media platform before accessing
              or using the Services. Social media features and widgets may be hosted by a
              third party or hosted directly on our Services. Your interactions with these
              features are governed by the privacy notices of the companies that provide
              them. By clicking on one of these buttons, you agree to the use of this plugin
              and consequently the transfer of personal information to the corresponding
              social media service. We have no control over the essence and extent of these
              transmitted data or their additional processing.
            </li>
          </ul>
          <p className={bodyClass}>
            <strong className={bold}>Will your information be shared with anyone else?</strong>
          </p>
          <p className={bodyClass}>
            We may disclose your personal information with our service providers pursuant to a
            written contract between us and each service provider. Learn more about how we
            disclose personal information to in the section,{" "}
            <a href="#whoshare" className={linkClass}>
              WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </a>
          </p>
          <p className={bodyClass}>
            We may use your personal information for our own business purposes, such as for
            undertaking internal research for technological development and demonstration.
            This is not considered to be &ldquo;selling&rdquo; of your personal information.
          </p>
          <p className={bodyClass}>
            We have not sold or shared any personal information to third parties for a
            business or commercial purpose in the preceding twelve (12) months. We have
            disclosed the following categories of personal information to third parties for a
            business or commercial purpose in the preceding twelve (12) months:
          </p>
          <ul className={listClass}>
            {disclosedCategories.map((cat) => (
              <li key={cat} className={listItemClass}>
                {cat}
              </li>
            ))}
          </ul>
          <p className={bodyClass}>
            The categories of third parties to whom we disclosed personal information for a
            business or commercial purpose can be found under{" "}
            <a href="#whoshare" className={linkClass}>
              WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </a>
          </p>
          <h3 className={subheadingClass}>Your Rights</h3>
          <p className={bodyClass}>
            You have rights under certain US state data protection laws. However, these
            rights are not absolute, and in certain cases, we may decline your request as
            permitted by law. These rights include:
          </p>
          <ul className={listClass}>
            {yourRights.map(([label, rest]) => (
              <li key={label} className={listItemClass}>
                <strong className={bold}>{label}</strong> {rest}
              </li>
            ))}
          </ul>
          <p className={bodyClass}>
            Depending upon the state where you live, you may also have the following rights:
          </p>
          <ul className={listClass}>
            {additionalRights.map((item) => (
              <li key={item} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
          <h3 className={subheadingClass}>How to Exercise Your Rights</h3>
          <p className={bodyClass}>
            To exercise these rights, you can contact us by visiting{" "}
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {CONTACT_URL}
            </a>
            , by emailing us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            , or by referring to the contact details at the bottom of this document.
          </p>
          <p className={bodyClass}>
            We will honor your opt-out preferences if you enact the{" "}
            <a
              href="https://globalprivacycontrol.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Global Privacy Control
            </a>{" "}
            (GPC) opt-out signal on your browser.
          </p>
          <p className={bodyClass}>
            Under certain US state data protection laws, you can designate an authorized
            agent to make a request on your behalf. We may deny a request from an authorized
            agent that does not submit proof that they have been validly authorized to act on
            your behalf in accordance with applicable laws.
          </p>
          <h3 className={subheadingClass}>Request Verification</h3>
          <p className={bodyClass}>
            Upon receiving your request, we will need to verify your identity to determine
            you are the same person about whom we have the information in our system. We will
            only use personal information provided in your request to verify your identity or
            authority to make the request. However, if we cannot verify your identity from
            the information already maintained by us, we may request that you provide
            additional information for the purposes of verifying your identity and for
            security or fraud-prevention purposes.
          </p>
          <p className={bodyClass}>
            If you submit the request through an authorized agent, we may need to collect
            additional information to verify your identity before processing your request and
            the agent will need to provide a written and signed permission from you to submit
            such request on your behalf.
          </p>
          <h3 className={subheadingClass}>Appeals</h3>
          <p className={bodyClass}>
            Under certain US state data protection laws, if we decline to take action
            regarding your request, you may appeal our decision by emailing us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            . We will inform you in writing of any action taken or not taken in response to
            the appeal, including a written explanation of the reasons for the decisions. If
            your appeal is denied, you may submit a complaint to your state attorney general.
          </p>
          <h3 className={subheadingClass}>California &ldquo;Shine The Light&rdquo; Law</h3>
          <p className={bodyClass}>
            California Civil Code Section 1798.83, also known as the &ldquo;Shine The
            Light&rdquo; law, permits our users who are California residents to request and
            obtain from us, once a year and free of charge, information about categories of
            personal information (if any) we disclosed to third parties for direct marketing
            purposes and the names and addresses of all third parties with which we shared
            personal information in the immediately preceding calendar year. If you are a
            California resident and would like to make such a request, please submit your
            request in writing to us by using the contact details provided in the section{" "}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>
          </p>

          <h2 id="policyupdates" className={headingClass}>
            15. Do We Make Updates To This Notice?
          </h2>
          <p className={bodyClass}>
            <em>
              <strong>In Short:</strong> Yes, we will update this notice as necessary to
              stay compliant with relevant laws.
            </em>
          </p>
          <p className={bodyClass}>
            We may update this Privacy Notice from time to time. The updated version will be
            indicated by an updated &ldquo;Revised&rdquo; date at the top of this Privacy
            Notice. If we make material changes to this Privacy Notice, we may notify you
            either by prominently posting a notice of such changes or by directly sending you
            a notification. We encourage you to review this Privacy Notice frequently to be
            informed of how we are protecting your information.
          </p>

          <h2 id="contact" className={headingClass}>
            16. How Can You Contact Us About This Notice?
          </h2>
          <p className={bodyClass}>
            If you have questions or comments about this notice, you may contact our Data
            Protection Officer (DPO) by email at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
              {PRIVACY_EMAIL}
            </a>
            , or contact us by post at:
          </p>
          <address className="not-italic text-[15px] leading-[1.8] text-[#c7c7c7]">
            {COMPANY}
            <br />
            Data Protection Officer
            <br />
            ave. Voskresenskyi, build 24, housing A, fl. 14
            <br />
            Kyiv, Kyiv 02125
            <br />
            Ukraine
          </address>

          <h2 id="request" className={headingClass}>
            17. How Can You Review, Update, Or Delete The Data We Collect From You?
          </h2>
          <p className={bodyClass}>
            Based on the applicable laws of your country or state of residence in the US, you
            may have the right to request access to the personal information we collect from
            you, details about how we have processed it, correct inaccuracies, or delete your
            personal information. You may also have the right to withdraw your consent to our
            processing of your personal information. These rights may be limited in some
            circumstances by applicable law. To request to review, update, or delete your
            personal information, please visit:{" "}
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {CONTACT_URL}
            </a>
            .
          </p>
        </div>
      </Container>
      <PlatformFooter />
    </div>
  )
}
