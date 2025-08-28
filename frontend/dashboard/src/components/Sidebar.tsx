import React from 'react'

interface SidebarProps{
    batteryPercent: number;
    isCharging: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({ batteryPercent, isCharging }) => {
    const  sidenavs = [
        {title: 'Overall'},
        {title: 'CPU'},
        {title: 'RAM'},
        {title: 'Battery'},
        {title: 'Device Information'},
    ]
    // console.log(isCharging)
    return (
        <div className='relative w-[20vw] h-full bg-gray-50 rounded-lg px-3'>
            <div className='flex items-center justify-start mt-2'>
                <img src="/leviLogo.png" alt="Levi Logo" className='object-contain w-[5rem]'/>
                <p className='text-[2rem] lobster font-bold leading-[100%] text-[#001233]'>Corepulse</p>
            </div>
            <div className='mt-10 flex flex-col gap-5 px-3'>
                {sidenavs.map((nav) => (
                    <div key={nav.title} className='text-gray-600 hover:text-gray-800 cursor-pointer'>{nav.title}</div>
                ))}
            </div>
            <div className='absolute left-0 bottom-10 mx-auto w-full'>
                <div className={`absolute right-6 top-5 w-3 h-3 rounded-full ${isCharging ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className='text-[5rem] font-bold text-center text-gray-400 font-sans mt-1'>{batteryPercent}<span className='text-2xl'>%</span></p>
            </div>
        </div>
    )
}

export default Sidebar