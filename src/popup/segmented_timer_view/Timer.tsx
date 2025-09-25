import digitalNumbersBg from '/digitalNumbersBg.png';

type Props = {
  remaining: number;
}

const Timer = ({ remaining }: Props) => {
  return (
    <div className="relative h-[164px] flex justify-center items-center my-5">
      <div className={`absolute flex gap-3 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-2xl text-black`}>
        <div className='w-[90px] relative'>
          <img className='max-w-full' src={digitalNumbersBg} />
          <p className='absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] !font-["Digital_Numbers_Regular"] text-4xl'>
            {Math.floor((remaining) / 60).toString().padStart(2, "0")}
          </p>
        </div>

        <div className='w-[90px] relative'>
          <img className='max-w-full' src={digitalNumbersBg} />
          <p className='absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] !font-["Digital_Numbers_Regular"] text-4xl'>
            {Math.floor((remaining) % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Timer
