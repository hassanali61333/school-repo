import "./globals.css";
import { ReduxProvider } from "./ReduxProvider";
  export const metadata = {
  title: "StudyProAI",
  description: "StudyProAI Learning Platform",
};
export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}