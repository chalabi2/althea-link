"use client";

import "./globals.scss";
import InfoBar from "@/components/info_bar/infoBar";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/nav_bar/navBar";
import CantoWalletProvider from "@/provider/rainbowProvider";
import localFont from "next/font/local";
import DesktopOnly from "@/components/desktop-only/desktop-only";
import { ReactQueryClientProvider } from "@/provider/reactQueryProvider";
import ToastWizard from "@/components/walletWizard/wizardToast";
import { WalletWizardModal } from "@/components/walletWizard/wizardModal";
import { useState } from "react";
import { ToastContainer } from "@/components/toast";
import useScreenSize from "@/hooks/helpers/useScreenSize";

const nm_plex = localFont({
  src: "../fonts/IBMPlexSans-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--nm-plex",
});

const nm_macan = localFont({
  src: "../fonts/macan.ttf",
  weight: "400",
  style: "normal",
  variable: "--nm-macan",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isWalletWizardOpen, setIsWalletWizardOpen] = useState(false);

  const [showToast, setShowToast] = useState(true);

  const openWalletWizard = () => {
    setIsWalletWizardOpen(true);
    setShowToast(false);
  };

  const closeWalletWizard = () => {
    setIsWalletWizardOpen(false);
    setShowToast(true);
  };

  const { isMobile } = useScreenSize();

  return (
    <html lang="en">
      {/* <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head> */}
      {/* <!-- Primary Meta Tags --> */}
      <title>althea app</title>
      <meta name="title" content="althea app" />
      <meta
        name="description"
        content="Althea is your gateway to cross-chain liquid infrastructure"
      />

      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://althea.app" />
      <meta property="og:title" content="Althea.app" />
      <meta
        property="og:description"
        content="Althea is your gateway to cross-chain liquid infrastrucute_"
      />
      <meta property="og:image" content="https://althea.app/meta.jpg" />

      {/* <!-- Twitter --> */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://althea.app" />
      <meta property="twitter:title" content="Althea.app" />
      <meta
        property="twitter:description"
        content="Althea is your gateway to cross-chain liquid infrastrucute_"
      />
      <meta property="twitter:image" content="https://althea.app/meta.jpg" />

      <body
        className={"dark"}
        style={
          {
            "--nm-plex": nm_plex.style.fontFamily,
            "--nm-macan": nm_macan.style.fontFamily,
          } as React.CSSProperties
        }
      >
        <div id="toast-root"></div>
        <CantoWalletProvider>
          <ReactQueryClientProvider>
            <ToastContainer>
              <div className="body">
                {/* <InfoBar
                values={[
                  {
                    name: "contracts w/ CSR enabled:",
                    value: "$1,210.56",
                    change: "+2% $23.4",
                    isPositive: true,
                  },
                  {
                    name: "CANTO price:",
                    value: "$1,210.56",
                    change: "+22%",
                    isPositive: true,
                  },
                  {
                    name: "TVL:",
                    value: "$1,210.56",
                    change: "-1.2%",
                    isPositive: false,
                  },
                  {
                    name: "Market Cap:",
                    value: "$1,435,438.56",
                    change: "-34.2%",
                    isPositive: false,
                  },
                ]}
              /> */}
                <NavBar />

                {children}
                {!isMobile && (
                  <div id="modal-root">
                    {showToast && (
                      <ToastWizard
                        isVisible={showToast}
                        onOpenModal={openWalletWizard}
                        onClose={() => setShowToast(false)}
                      />
                    )}
                    <WalletWizardModal
                      balance={10}
                      isOpen={isWalletWizardOpen}
                      onOpen={setIsWalletWizardOpen}
                      onClose={closeWalletWizard}
                    />
                  </div>
                )}

                <Footer />
              </div>
            </ToastContainer>
          </ReactQueryClientProvider>
        </CantoWalletProvider>
      </body>
    </html>
  );
}
