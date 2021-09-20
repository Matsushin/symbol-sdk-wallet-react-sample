export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <div className="relative bg-white">
        <div className="max-w-9xl mx-auto border-solid border-b border-gray-200 px-4 sm:px-6">
          <div className="flex justify-between items-center pt-4 pb-2 md:justify-start md:space-x-5">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <p className="text-yellow-500 font-bold">Symbol Sample</p>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-9xl">
        <div className="main-container">
          {children}
        </div>
      </main>
    </>
  )
}