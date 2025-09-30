type Props = {
  currView: string;
  setCurrView: React.Dispatch<React.SetStateAction<string>>;
}

const ViewSettings = ({ currView, setCurrView }: Props) => {
  return (
    <div className="p-6 text-white">
      <h2 className="font-medium text-lg mb-6">Görünümler</h2>
      <h3 className="font-medium text-sm mb-1">Odak</h3>
      <p className="font-normal text-sm text-[#9F938F]">Masaüstünüzdeki widget için görünümü seçebilirsiniz.</p>
      <div className="flex gap-6 mt-6">
        <div className={`w-[344px] cursor-pointer rounded-3xl border ${currView === "circular" ? "border-[#F2F0F0]" : "border-[#3D3836]"}`} onClick={() => setCurrView("circular")}><img src="/views/circular-view.png" /></div>
        <div className={`w-[344px] cursor-pointer rounded-3xl border ${currView === "digital" ? "border-[#F2F0F0]" : "border-[#3D3836]"}`} onClick={() => setCurrView("digital")}><img src="/views/digital-view.png" /></div>
        <div className={`w-[344px] cursor-pointer rounded-3xl border ${currView === "segmented" ? "border-[#F2F0F0]" : "border-[#3D3836]"}`} onClick={() => setCurrView("segmented")}><img src="/views/segmented-view.png" /></div>
      </div>
    </div>
  )
}

export default ViewSettings;
