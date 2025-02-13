const ChatLoadingSkeleton = () => {
    return ( 
    <div role="status" className="animate-pulse w-full h-full space-y-6 pt-5">
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 max-w-[240px] mb-2.5"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 mb-2.5 max-w-[250px] ml-auto"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 max-w-[260px] mb-2.5"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 max-w-[260px] mb-2.5 ml-auto"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 max-w-[290px] mb-2.5 ml-auto"></div>
        <div className="h-9 bg-red-200 rounded-full dark:bg-gray-700 max-w-[260px]"></div>
        {/* <span className="sr-only">Loading...</span> */}
    </div>
    );
}
 
export default ChatLoadingSkeleton;