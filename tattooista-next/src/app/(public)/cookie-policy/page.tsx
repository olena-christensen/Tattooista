import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/shared/container"
import { PlatformHeader } from "@/components/shared/platform-header"
import { PlatformFooter } from "@/components/shared/platform-footer"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Tattooista uses cookies and similar technologies, and how you can control them.",
}

const COMPANY = "Olena Christensen, Individual Entrepreneur (FOP)"

const headingClass =
  "font-display text-[clamp(22px,3vw,28px)] font-normal uppercase tracking-[1px] mt-14 mb-4"
const subheadingClass =
  "text-[13px] tracking-[2px] uppercase text-muted-foreground mt-8 mb-3"
const bodyClass = "text-[15px] leading-[1.8] text-[#c7c7c7] mb-4"
const linkClass =
  "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors break-words"
const listClass = "flex flex-col gap-2 my-4"
const listItemClass =
  "text-[15px] leading-[1.8] text-[#c7c7c7] pl-6 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground"

const browserLinks = [
  {
    label: "Chrome",
    href: "https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies",
  },
  {
    label: "Internet Explorer",
    href: "https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d",
  },
  {
    label: "Firefox",
    href: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US",
  },
  {
    label: "Safari",
    href: "https://support.apple.com/en-ie/guide/safari/sfri11471/mac",
  },
  {
    label: "Edge",
    href: "https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd",
  },
  {
    label: "Opera",
    href: "https://help.opera.com/en/latest/web-preferences/",
  },
]

const optOutLinks = [
  { label: "Digital Advertising Alliance", href: "http://www.aboutads.info/choices/" },
  {
    label: "Digital Advertising Alliance of Canada",
    href: "https://youradchoices.ca/",
  },
  {
    label: "European Interactive Digital Advertising Alliance",
    href: "http://www.youronlinechoices.com/",
  },
]

const cookieDetails = [
  { label: "Name", value: "s7" },
  {
    label: "Purpose",
    value: "Gather data regarding site usage and user behavior on the website.",
  },
  { label: "Provider", value: "tattooista.app" },
  { label: "Type", value: "server_cookie" },
  { label: "Expires in", value: "Session" },
]

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>
        <p className="text-[13px] tracking-[1.5px] uppercase text-muted-foreground mt-4">
          Last updated May 30, 2026
        </p>

        <div className="mt-12">
          <p className={bodyClass}>
            This Cookie Policy explains how {COMPANY} (&ldquo;
            <strong className="text-foreground font-semibold">Company</strong>,&rdquo;
            &ldquo;<strong className="text-foreground font-semibold">we</strong>,&rdquo;
            &ldquo;<strong className="text-foreground font-semibold">us</strong>,&rdquo;
            and &ldquo;<strong className="text-foreground font-semibold">our</strong>
            &rdquo;) uses cookies and similar technologies to recognize you when you
            visit our website at{" "}
            <a
              href="https://tattooista.app"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://tattooista.app
            </a>{" "}
            (&ldquo;<strong className="text-foreground font-semibold">Website</strong>
            &rdquo;). It explains what these technologies are and why we use them, as
            well as your rights to control our use of them.
          </p>
          <p className={bodyClass}>
            In some cases we may use cookies to collect personal information, or that
            becomes personal information if we combine it with other information.
          </p>

          <h2 className={headingClass}>What are cookies?</h2>
          <p className={bodyClass}>
            Cookies are small data files that are placed on your computer or mobile
            device when you visit a website. Cookies are widely used by website owners
            in order to make their websites work, or to work more efficiently, as well
            as to provide reporting information.
          </p>
          <p className={bodyClass}>
            Cookies set by the website owner (in this case, {COMPANY}) are called
            &ldquo;first-party cookies.&rdquo; Cookies set by parties other than the
            website owner are called &ldquo;third-party cookies.&rdquo; Third-party
            cookies enable third-party features or functionality to be provided on or
            through the website (e.g., advertising, interactive content, and analytics).
            The parties that set these third-party cookies can recognize your computer
            both when it visits the website in question and also when it visits certain
            other websites.
          </p>

          <h2 className={headingClass}>Why do we use cookies?</h2>
          <p className={bodyClass}>
            We use first- and third-party cookies for several reasons. Some cookies are
            required for technical reasons in order for our Website to operate, and we
            refer to these as &ldquo;essential&rdquo; or &ldquo;strictly
            necessary&rdquo; cookies. Other cookies also enable us to track and target
            the interests of our users to enhance the experience on our Online
            Properties. Third parties serve cookies through our Website for advertising,
            analytics, and other purposes. This is described in more detail below.
          </p>

          <h2 className={headingClass}>How can I control cookies?</h2>
          <p className={bodyClass}>
            You have the right to decide whether to accept or reject cookies. You can
            exercise your cookie rights by setting your preferences in the Cookie
            Preference Center. The Cookie Preference Center allows you to select which
            categories of cookies you accept or reject. Essential cookies cannot be
            rejected as they are strictly necessary to provide you with services.
          </p>
          <p className={bodyClass}>
            The Cookie Preference Center can be found in the notification banner and on
            our Website. If you choose to reject cookies, you may still use our Website
            though your access to some functionality and areas of our Website may be
            restricted. You may also set or amend your web browser controls to accept or
            refuse cookies.
          </p>
          <p className={bodyClass}>
            The specific types of first- and third-party cookies served through our
            Website and the purposes they perform are described in the table below
            (please note that the specific cookies served may vary depending on the
            specific Online Properties you visit):
          </p>

          <h3 className={subheadingClass}>Analytics and customization cookies:</h3>
          <p className={bodyClass}>
            These cookies collect information that is used either in aggregate form to
            help us understand how our Website is being used or how effective our
            marketing campaigns are, or to help us customize our Website for you.
          </p>

          <div className="border border-border p-6 my-6">
            <dl className="flex flex-col gap-3">
              {cookieDetails.map((row) => (
                <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="min-w-[90px] text-[13px] uppercase tracking-[1px] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="text-[14px] text-[#c7c7c7] break-words">{row.value}</dd>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <dt className="min-w-[90px] text-[13px] uppercase tracking-[1px] text-muted-foreground">
                  Service
                </dt>
                <dd className="text-[14px] text-[#c7c7c7] break-words">
                  Adobe Analytics{" "}
                  <a
                    href="https://www.adobe.com/uk/privacy/policy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    View Service Privacy Policy
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <h2 className={headingClass}>How can I control cookies on my browser?</h2>
          <p className={bodyClass}>
            As the means by which you can refuse cookies through your web browser
            controls vary from browser to browser, you should visit your browser&rsquo;s
            help menu for more information. The following is information about how to
            manage cookies on the most popular browsers:
          </p>
          <ul className={listClass}>
            {browserLinks.map((b) => (
              <li key={b.label} className={listItemClass}>
                <a
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {b.label}
                </a>
              </li>
            ))}
          </ul>
          <p className={bodyClass}>
            In addition, most advertising networks offer you a way to opt out of
            targeted advertising. If you would like to find out more information, please
            visit:
          </p>
          <ul className={listClass}>
            {optOutLinks.map((o) => (
              <li key={o.label} className={listItemClass}>
                <a
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {o.label}
                </a>
              </li>
            ))}
          </ul>

          <h2 className={headingClass}>
            What about other tracking technologies, like web beacons?
          </h2>
          <p className={bodyClass}>
            Cookies are not the only way to recognize or track visitors to a website. We
            may use other, similar technologies from time to time, like web beacons
            (sometimes called &ldquo;tracking pixels&rdquo; or &ldquo;clear gifs&rdquo;).
            These are tiny graphics files that contain a unique identifier that enables
            us to recognize when someone has visited our Website or opened an email
            including them. This allows us, for example, to monitor the traffic patterns
            of users from one page within a website to another, to deliver or
            communicate with cookies, to understand whether you have come to the website
            from an online advertisement displayed on a third-party website, to improve
            site performance, and to measure the success of email marketing campaigns.
            In many instances, these technologies are reliant on cookies to function
            properly, and so declining cookies will impair their functioning.
          </p>

          <h2 className={headingClass}>
            Do you use Flash cookies or Local Shared Objects?
          </h2>
          <p className={bodyClass}>
            Websites may also use so-called &ldquo;Flash Cookies&rdquo; (also known as
            Local Shared Objects or &ldquo;LSOs&rdquo;) to, among other things, collect
            and store information about your use of our services, fraud prevention, and
            for other site operations.
          </p>
          <p className={bodyClass}>
            If you do not want Flash Cookies stored on your computer, you can adjust the
            settings of your Flash player to block Flash Cookies storage using the tools
            contained in the{" "}
            <a
              href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Website Storage Settings Panel
            </a>
            . You can also control Flash Cookies by going to the{" "}
            <a
              href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Global Storage Settings Panel
            </a>{" "}
            and following the instructions (which may include instructions that explain,
            for example, how to delete existing Flash Cookies (referred to
            &ldquo;information&rdquo; on the Macromedia site), how to prevent Flash LSOs
            from being placed on your computer without your being asked, and (for Flash
            Player 8 and later) how to block Flash Cookies that are not being delivered
            by the operator of the page you are on at the time).
          </p>
          <p className={bodyClass}>
            Please note that setting the Flash Player to restrict or limit acceptance of
            Flash Cookies may reduce or impede the functionality of some Flash
            applications, including, potentially, Flash applications used in connection
            with our services or online content.
          </p>

          <h2 className={headingClass}>Do you serve targeted advertising?</h2>
          <p className={bodyClass}>
            Third parties may serve cookies on your computer or mobile device to serve
            advertising through our Website. These companies may use information about
            your visits to this and other websites in order to provide relevant
            advertisements about goods and services that you may be interested in. They
            may also employ technology that is used to measure the effectiveness of
            advertisements. They can accomplish this by using cookies or web beacons to
            collect information about your visits to this and other sites in order to
            provide relevant advertisements about goods and services of potential
            interest to you. The information collected through this process does not
            enable us or them to identify your name, contact details, or other details
            that directly identify you unless you choose to provide these.
          </p>

          <h2 className={headingClass}>How often will you update this Cookie Policy?</h2>
          <p className={bodyClass}>
            We may update this Cookie Policy from time to time in order to reflect, for
            example, changes to the cookies we use or for other operational, legal, or
            regulatory reasons. Please therefore revisit this Cookie Policy regularly to
            stay informed about our use of cookies and related technologies.
          </p>
          <p className={bodyClass}>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </p>

          <h2 className={headingClass}>Where can I get further information?</h2>
          <p className={bodyClass}>
            If you have any questions about our use of cookies or other technologies,
            please email us at{" "}
            <a href="mailto:founder@nothingweird.agency" className={linkClass}>
              founder@nothingweird.agency
            </a>{" "}
            or by post to:
          </p>
          <address className="not-italic text-[15px] leading-[1.8] text-[#c7c7c7]">
            {COMPANY}
            <br />
            Mykolaiv, Mykolaiv 54028
            <br />
            Ukraine
            <br />
            Phone: (+380)776591244
          </address>
        </div>
      </Container>
      <PlatformFooter />
    </div>
  )
}
