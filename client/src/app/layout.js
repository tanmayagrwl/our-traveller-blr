import "./globals.css";

export const metadata = {
    title: 'Namma Yatri - Peak-Hour Demand Optimizer',
    description: 'Solving peak-hour demand imbalance and reducing ride denials',
  }
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en" data-theme="light">
        <body>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </body>
      </html>
    )
  }