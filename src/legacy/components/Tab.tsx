interface TabProps {
  type?: string
  filter: number
  setFilter: (n: number) => void
}

export function Tab({ type, filter, setFilter }: TabProps) {
  return (
    <div className="justiify-center mx-auto mt-3 max-w-5xl">
      <nav className="ml-1 flex space-x-0" aria-label="Tabs">
        <div className="mx-3 my-2 cursor-pointer rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">
          <div
            onClick={() => setFilter(0)}
            className={
              filter === 0
                ? 'bg-brand-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white'
                : 'rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700'
            }
          >
            All
          </div>
        </div>

        <div className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <div
            onClick={() => setFilter(1)}
            className={
              filter === 1
                ? 'bg-brand-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white'
                : 'rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700'
            }
          >
            {type === 'check' ? '확인' : '제출'}
          </div>
        </div>
        <div className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <div
            onClick={() => setFilter(2)}
            className={
              filter === 2
                ? 'bg-brand-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white'
                : 'rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700'
            }
          >
            {type === 'check' ? '미확인' : '미제출'}
          </div>
        </div>
      </nav>
    </div>
  )
}
