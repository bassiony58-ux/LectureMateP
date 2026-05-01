import { Link } from "wouter";

const footLink =
  "hover:text-primary transition-colors no-underline text-inherit";

export default function Footer() {
  return (
    <footer className="mt-16 sm:mt-20 px-8 sm:px-12 py-12 bg-[#eceef1] rounded-t-[1.75rem] border-t border-outline-variant/40">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-outline-variant/20 pb-12">
        <div className="max-w-xs">
          <h2 className="text-2xl font-extrabold text-primary mb-3 font-['Merriweather',Georgia,serif] tracking-tight">
            Lecture Mate
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The premier academic curator for the modern scholar. Transforming
            chaos into clarity, one lecture at a time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold mb-4 font-headline uppercase text-[10px] tracking-widest text-on-surface">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li>
                <Link href="/" className={footLink}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="/" className={footLink}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className={footLink}>
                  Scholarships
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-headline uppercase text-[10px] tracking-widest text-on-surface">
              Community
            </h4>
            <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li>
                <Link href="/" className={footLink}>
                  Study Groups
                </Link>
              </li>
              <li>
                <Link href="/history" className={footLink}>
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/" className={footLink}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-headline uppercase text-[10px] tracking-widest text-on-surface">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li>
                <Link href="/" className={footLink}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/profile" className={footLink}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className={footLink}>
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center py-10 gap-6">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          © {new Date().getFullYear()} Lecture Mate Inc. All rights reserved.
        </p>
        <div className="flex gap-10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          <Link href="/" className={footLink}>
            Privacy Policy
          </Link>
          <Link href="/" className={footLink}>
            Terms of Service
          </Link>
          <Link href="/" className={footLink}>
            Cookie Settings
          </Link>
        </div>
      </div>
    </footer>
  );
}
