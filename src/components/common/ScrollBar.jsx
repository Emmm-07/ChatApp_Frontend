const ScrollBar = ({children, height = "h-[100px]", className = ""}) => {
    return (  
        <div className={`${height} ${className} overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`}
        >
        {children}
      </div>
    );
}
 
export default ScrollBar;