import React, { createContext, useContext, useState } from "react";

const DataContext = createContext(null);
{/* 전역 상태에 저장하고 다음 페이지에서 불러오는 방식 */}

export function DataProvider({children}){
    const [data, setData] = useState({});

    return (
        <DataContext.Provider value={{data, setData}}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(){
    return useContext(DataContext);
}