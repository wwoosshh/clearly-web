"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { unwrapResponse } from "@/lib/apiHelpers";
import { uploadImage } from "@/lib/upload";
import { useAddressSuggestions } from "@/hooks/useAddressSuggestions";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

interface FormData {
  businessName: string;
  representative: string;
  address: string;
  detailAddress: string;
  description: string;
  contactEmail: string;
  companyUrl: string;
  contactHours: string;
  specialties: string[];
  serviceAreas: string[];
  serviceRange: string;
  minPrice: string;
  maxPrice: string;
  serviceDetail: string;
  employeeCount: string;
  experienceYears: string;
  experienceDescription: string;
  education: string;
  profileImages: string[];
  videos: string[];
  portfolio: { title: string; description: string; images: string[] }[];
  businessRegistration: string;
  certificationDocs: { name: string; imageUrl: string }[];
  certificates: string[];
  paymentMethods: string[];
  faq: { question: string; answer: string }[];
}

const INITIAL_FORM: FormData = {
  businessName: "", representative: "", address: "", detailAddress: "",
  description: "", contactEmail: "", companyUrl: "", contactHours: "",
  specialties: [], serviceAreas: [], serviceRange: "", minPrice: "", maxPrice: "",
  serviceDetail: "", employeeCount: "", experienceYears: "", experienceDescription: "",
  education: "", profileImages: [], videos: [], portfolio: [],
  businessRegistration: "", certificationDocs: [], certificates: [],
  paymentMethods: [], faq: [],
};

const PAYMENT_OPTIONS = ["카드", "현금", "계좌이체", "네이버페이", "카카오페이"];

const SECTIONS = [
  { key: "basic", title: "기본 정보" },
  { key: "service", title: "서비스 정보" },
  { key: "career", title: "경력 및 학력" },
  { key: "media", title: "사진 / 동영상" },
  { key: "portfolio", title: "포트폴리오" },
  { key: "cert", title: "인증 서류" },
  { key: "payment", title: "결제 정보" },
  { key: "faq", title: "자주 묻는 질문 (Q&A)" },
] as const;

export default function CompanyProfileEditPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...INITIAL_FORM });
  const [originalForm, setOriginalForm] = useState<FormData>({ ...INITIAL_FORM });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ basic: true });
  const [isUploading, setIsUploading] = useState(false);

  const [newSpecialty, setNewSpecialty] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newVideo, setNewVideo] = useState("");
  const [newCertName, setNewCertName] = useState("");
  const [newCert, setNewCert] = useState("");

  // 주소 자동완성
  const [addressQuery, setAddressQuery] = useState("");
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const { suggestions: addressSuggestions, isLoading: addressSearchLoading, clear: clearAddressSuggestions } =
    useAddressSuggestions(addressQuery);
  const addressWrapRef = useRef<HTMLDivElement>(null);

  const profileImgRef = useRef<HTMLInputElement>(null);
  const bizRegRef = useRef<HTMLInputElement>(null);
  const certDocRef = useRef<HTMLInputElement>(null);
  const portfolioImgRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    loadCompany();
  }, []);

  // 주소 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addressWrapRef.current && !addressWrapRef.current.contains(e.target as Node)) {
        setShowAddressSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadCompany = async () => {
    try {
      const response = await api.get("/companies/my");
      const c = unwrapResponse<any>(response);
      setCompanyId(c.id);
      const loaded: FormData = {
        businessName: c.businessName || "",
        representative: c.representative || "",
        address: c.address || "",
        detailAddress: c.detailAddress || "",
        description: c.description || "",
        contactEmail: c.contactEmail || "",
        companyUrl: c.companyUrl || "",
        contactHours: c.contactHours || "",
        specialties: Array.isArray(c.specialties) ? c.specialties : [],
        serviceAreas: Array.isArray(c.serviceAreas) ? c.serviceAreas : [],
        serviceRange: c.serviceRange != null ? String(c.serviceRange) : "",
        minPrice: c.minPrice != null ? String(c.minPrice) : "",
        maxPrice: c.maxPrice != null ? String(c.maxPrice) : "",
        serviceDetail: c.serviceDetail || "",
        employeeCount: c.employeeCount != null ? String(c.employeeCount) : "",
        experienceYears: c.experienceYears != null ? String(c.experienceYears) : "",
        experienceDescription: c.experienceDescription || "",
        education: c.education || "",
        profileImages: Array.isArray(c.profileImages) ? c.profileImages : [],
        videos: Array.isArray(c.videos) ? c.videos : [],
        portfolio: Array.isArray(c.portfolio) ? c.portfolio : [],
        businessRegistration: c.businessRegistration || "",
        certificationDocs: Array.isArray(c.certificationDocs) ? c.certificationDocs : [],
        certificates: Array.isArray(c.certificates) ? c.certificates : [],
        paymentMethods: Array.isArray(c.paymentMethods) ? c.paymentMethods : [],
        faq: Array.isArray(c.faq) ? c.faq : [],
      };
      setForm(loaded);
      setOriginalForm(loaded);
    } catch {
      alert("업체 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const removeAt = <T,>(arr: T[], i: number) => arr.filter((_, idx) => idx !== i);

  const handleSave = async () => {
    if (!companyId) return;
    setIsSaving(true);
    try {
      const patch: any = {};
      for (const key of Object.keys(form) as (keyof FormData)[]) {
        if (JSON.stringify(form[key]) !== JSON.stringify(originalForm[key])) {
          const val = form[key];
          if (["minPrice", "maxPrice", "employeeCount", "experienceYears", "serviceRange"].includes(key)) {
            patch[key] = val !== "" ? Number(val) : null;
          } else {
            patch[key] = val;
          }
        }
      }
      if (Object.keys(patch).length === 0) {
        alert("변경된 내용이 없습니다.");
        setIsSaving(false);
        return;
      }
      await api.patch(`/companies/${companyId}`, patch);
      alert("프로필이 저장되었습니다.");
      router.push("/mypage");
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    onComplete: (url: string) => void,
  ) => {
    setIsUploading(true);
    try {
      const result = await uploadImage(file, "companies");
      onComplete(result.url);
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || user.role !== "COMPANY") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-[#72706a]">업체 계정만 접근할 수 있습니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 flex justify-center">
        <Spinner size="lg" className="text-[#4a8c6a]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <Link
            href="/mypage"
            className="mb-6 flex items-center gap-1 text-[14px] text-[#72706a] hover:text-[#1a1918] transition-colors press-scale"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            마이페이지
          </Link>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">프로필 편집</h1>
          <p className="mt-1.5 text-[15px] text-[#72706a]">업체 프로필을 수정합니다</p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 space-y-3">
          {SECTIONS.map(({ key, title }) => (
            <div key={key} className="rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8] press-scale"
              >
                <span className="text-[15px] font-semibold text-[#141412]">{title}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a49c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${expanded[key] ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expanded[key] && (
                <div className="border-t border-[#e2ddd6] px-5 py-5 space-y-4">
                  {key === "basic" && (
                    <>
                      <Field label="상호명" value={form.businessName} onChange={(v) => update("businessName", v)} />
                      <Field label="대표자명" value={form.representative} onChange={(v) => update("representative", v)} />
                      {/* 주소 자동완성 */}
                      <div ref={addressWrapRef} className="relative">
                        <label className="block text-[13px] font-medium text-[#1a1918] mb-1">주소</label>
                        <div className="relative flex items-center">
                          <svg className="absolute left-3 text-[#a8a49c]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <input
                            className="w-full rounded-lg border border-[#e2ddd6] bg-white py-2.5 pl-10 pr-10 text-[14px] text-[#1a1918] placeholder-[#a8a49c] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]/20 transition-colors"
                            placeholder="주소 검색 (예: 강남구, 역삼동)"
                            value={showAddressSuggestions ? addressQuery : form.address}
                            onChange={(e) => {
                              setAddressQuery(e.target.value);
                              setShowAddressSuggestions(true);
                            }}
                            onFocus={() => {
                              setAddressQuery("");
                              setShowAddressSuggestions(true);
                            }}
                          />
                          {form.address && (
                            <button
                              type="button"
                              className="absolute right-3 text-[#a8a49c] hover:text-[#72706a] transition-colors"
                              onClick={() => {
                                update("address", "");
                                setAddressQuery("");
                                setShowAddressSuggestions(false);
                                clearAddressSuggestions();
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {showAddressSuggestions && (addressQuery.length >= 2 || addressSearchLoading) && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[220px] overflow-y-auto rounded-lg border border-[#e2ddd6] bg-white shadow-lg">
                            {addressSearchLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Spinner />
                              </div>
                            ) : addressSuggestions.length > 0 ? (
                              addressSuggestions.map((s, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="w-full px-4 py-2.5 text-left hover:bg-[#f0ede8] border-b border-[#e2ddd6] last:border-b-0 transition-colors"
                                  onClick={() => {
                                    const display = s.roadAddress || s.jibunAddress || s.address;
                                    update("address", display);
                                    setAddressQuery("");
                                    setShowAddressSuggestions(false);
                                    clearAddressSuggestions();
                                  }}
                                >
                                  <div className="text-[14px] font-semibold text-[#141412] truncate">
                                    {s.placeName || s.roadAddress || s.address}
                                  </div>
                                  {s.placeName && s.roadAddress ? (
                                    <div className="text-[12px] text-[#72706a] mt-0.5 truncate">{s.roadAddress}</div>
                                  ) : s.jibunAddress ? (
                                    <div className="text-[12px] text-[#72706a] mt-0.5 truncate">{s.jibunAddress}</div>
                                  ) : null}
                                </button>
                              ))
                            ) : addressQuery.length >= 2 ? (
                              <div className="py-4 text-center text-[13px] text-[#a8a49c]">검색 결과가 없습니다</div>
                            ) : null}
                          </div>
                        )}
                        {form.address && !showAddressSuggestions && (
                          <p className="mt-1 text-[13px] font-medium text-[#2d6a4f]">{form.address}</p>
                        )}
                      </div>
                      <Field label="상세주소" value={form.detailAddress} onChange={(v) => update("detailAddress", v)} />
                      <Field label="이메일" value={form.contactEmail} onChange={(v) => update("contactEmail", v)} type="email" />
                      <Field label="웹사이트" value={form.companyUrl} onChange={(v) => update("companyUrl", v)} placeholder="https://" />
                      <Field label="연락가능시간" value={form.contactHours} onChange={(v) => update("contactHours", v)} placeholder="예: 09:00 - 18:00" />
                      <Field label="업체 소개" value={form.description} onChange={(v) => update("description", v)} multiline />
                    </>
                  )}

                  {key === "service" && (
                    <>
                      <TagField label="전문분야" tags={form.specialties} onRemove={(i) => update("specialties", removeAt(form.specialties, i))} inputValue={newSpecialty} onInputChange={setNewSpecialty} onAdd={() => { if (newSpecialty.trim()) { update("specialties", [...form.specialties, newSpecialty.trim()]); setNewSpecialty(""); } }} />
                      <TagField label="서비스 지역" tags={form.serviceAreas} onRemove={(i) => update("serviceAreas", removeAt(form.serviceAreas, i))} inputValue={newArea} onInputChange={setNewArea} onAdd={() => { if (newArea.trim()) { update("serviceAreas", [...form.serviceAreas, newArea.trim()]); setNewArea(""); } }} />
                      <Field label="활동가능범위 (km)" value={form.serviceRange} onChange={(v) => update("serviceRange", v)} type="number" />
                      <Field label="최소 가격 (원)" value={form.minPrice} onChange={(v) => update("minPrice", v)} type="number" />
                      <Field label="최대 가격 (원)" value={form.maxPrice} onChange={(v) => update("maxPrice", v)} type="number" />
                      <Field label="서비스 상세설명" value={form.serviceDetail} onChange={(v) => update("serviceDetail", v)} multiline />
                      <Field label="직원수" value={form.employeeCount} onChange={(v) => update("employeeCount", v)} type="number" />
                    </>
                  )}

                  {key === "career" && (
                    <>
                      <Field label="경력 (년)" value={form.experienceYears} onChange={(v) => update("experienceYears", v)} type="number" />
                      <Field label="경력 상세" value={form.experienceDescription} onChange={(v) => update("experienceDescription", v)} multiline />
                      <Field label="학력" value={form.education} onChange={(v) => update("education", v)} />
                    </>
                  )}

                  {key === "media" && (
                    <>
                      <div>
                        <label className="text-[13px] font-medium text-[#1a1918] block mb-2">업체 사진</label>
                        <input ref={profileImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => update("profileImages", [...form.profileImages, url]));
                          e.target.value = "";
                        }} />
                        <div className="flex flex-wrap gap-2">
                          {form.profileImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="" className="h-20 w-20 rounded-lg border border-[#e2ddd6] object-cover" />
                              <button
                                type="button"
                                onClick={() => update("profileImages", removeAt(form.profileImages, idx))}
                                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => profileImgRef.current?.click()}
                            disabled={isUploading}
                            className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-[#e2ddd6] text-[#a8a49c] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors disabled:opacity-50"
                          >
                            {isUploading ? <Spinner size="sm" /> : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[13px] font-medium text-[#1a1918] block mb-2">동영상 URL</label>
                        {form.videos.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#e2ddd6]">
                            <span className="text-[14px] text-[#1a1918] truncate flex-1">{url}</span>
                            <button type="button" onClick={() => update("videos", removeAt(form.videos, idx))} className="ml-2 text-[13px] text-red-500 hover:text-red-700 transition-colors">삭제</button>
                          </div>
                        ))}
                        <div className="mt-2 flex gap-2">
                          <input
                            value={newVideo}
                            onChange={(e) => setNewVideo(e.target.value)}
                            placeholder="동영상 URL 입력"
                            className="flex-1 rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newVideo.trim()) { update("videos", [...form.videos, newVideo.trim()]); setNewVideo(""); } }}
                            className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors press-scale"
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {key === "portfolio" && (
                    <>
                      {form.portfolio.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-[#f0ede8] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-semibold text-[#1a1918]">항목 {idx + 1}</span>
                            <button type="button" onClick={() => update("portfolio", removeAt(form.portfolio, idx))} className="text-[13px] text-red-500 hover:text-red-700 transition-colors">삭제</button>
                          </div>
                          <input
                            value={item.title}
                            onChange={(e) => { const u = [...form.portfolio]; u[idx] = { ...u[idx], title: e.target.value }; update("portfolio", u); }}
                            placeholder="제목"
                            className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => { const u = [...form.portfolio]; u[idx] = { ...u[idx], description: e.target.value }; update("portfolio", u); }}
                            placeholder="설명"
                            rows={2}
                            className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] resize-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <div className="flex flex-wrap gap-2">
                            {(item.images || []).map((img: string, imgIdx: number) => (
                              <div key={imgIdx} className="relative group">
                                <img src={img} alt="" className="h-16 w-16 rounded-lg border border-[#e2ddd6] object-cover" />
                                <button
                                  type="button"
                                  onClick={() => { const u = [...form.portfolio]; u[idx] = { ...u[idx], images: removeAt(u[idx].images, imgIdx) }; update("portfolio", u); }}
                                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            <input
                              ref={(el) => { portfolioImgRefs.current[idx] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, (url) => { const u = [...form.portfolio]; u[idx] = { ...u[idx], images: [...(u[idx].images || []), url] }; update("portfolio", u); });
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => portfolioImgRefs.current[idx]?.click()}
                              className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-[#e2ddd6] text-[#a8a49c] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => update("portfolio", [...form.portfolio, { title: "", description: "", images: [] }])}
                        className="w-full rounded-lg border-2 border-dashed border-[#e2ddd6] py-3 text-[14px] text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors press-scale"
                      >
                        + 포트폴리오 추가
                      </button>
                    </>
                  )}

                  {key === "cert" && (
                    <>
                      <div>
                        <label className="text-[13px] font-medium text-[#1a1918] block mb-2">보유 자격증</label>
                        {form.certificates.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {form.certificates.map((cert, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => update("certificates", removeAt(form.certificates, i))}
                                className="rounded-full bg-[#d4ede4] px-3 py-1 text-[13px] text-[#2d6a4f] hover:bg-[#c0e4d8] transition-colors press-scale"
                              >
                                {cert} <span className="ml-1 text-[#4a8c6a]">x</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            value={newCert}
                            onChange={(e) => setNewCert(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newCert.trim()) { update("certificates", [...form.certificates, newCert.trim()]); setNewCert(""); } } }}
                            placeholder="자격증명 입력 (예: 청소관련 자격증)"
                            className="flex-1 rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newCert.trim()) { update("certificates", [...form.certificates, newCert.trim()]); setNewCert(""); } }}
                            className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors press-scale"
                          >
                            추가
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-[#1a1918] block mb-2">사업자등록증</label>
                        <input ref={bizRegRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, (url) => update("businessRegistration", url)); e.target.value = ""; }} />
                        {form.businessRegistration ? (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-[14px] text-[#1a1918]">등록 완료</span>
                            <button type="button" onClick={() => update("businessRegistration", "")} className="text-[13px] text-red-500 hover:text-red-700 transition-colors">삭제</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => bizRegRef.current?.click()}
                            className="w-full rounded-lg border-2 border-dashed border-[#e2ddd6] py-3 text-[14px] text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors press-scale"
                          >
                            + 사업자등록증 업로드
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-[#1a1918] block mb-2">자격증/서류</label>
                        {form.certificationDocs.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#e2ddd6]">
                            <span className="text-[14px] text-[#1a1918]">{doc.name}</span>
                            <button type="button" onClick={() => update("certificationDocs", removeAt(form.certificationDocs, idx))} className="text-[13px] text-red-500 hover:text-red-700 transition-colors">삭제</button>
                          </div>
                        ))}
                        <input
                          ref={certDocRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && newCertName.trim()) {
                              handleFileUpload(file, (url) => { update("certificationDocs", [...form.certificationDocs, { name: newCertName.trim(), imageUrl: url }]); setNewCertName(""); });
                            } else if (!newCertName.trim()) {
                              alert("자격증명을 먼저 입력해주세요.");
                            }
                            e.target.value = "";
                          }}
                        />
                        <div className="mt-2 flex gap-2">
                          <input
                            value={newCertName}
                            onChange={(e) => setNewCertName(e.target.value)}
                            placeholder="자격증명 입력"
                            className="flex-1 rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => certDocRef.current?.click()}
                            className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors press-scale"
                          >
                            업로드
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {key === "payment" && (
                    <div>
                      <label className="text-[13px] font-medium text-[#1a1918] block mb-2">결제수단</label>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_OPTIONS.map((opt) => {
                          const selected = form.paymentMethods.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => update("paymentMethods", selected ? form.paymentMethods.filter((m) => m !== opt) : [...form.paymentMethods, opt])}
                              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors press-scale ${selected ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]" : "border-[#e2ddd6] text-[#72706a] hover:bg-[#f0ede8]"}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {key === "faq" && (
                    <>
                      {form.faq.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-[#f0ede8] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-semibold text-[#1a1918]">Q&A {idx + 1}</span>
                            <button type="button" onClick={() => update("faq", removeAt(form.faq, idx))} className="text-[13px] text-red-500 hover:text-red-700 transition-colors">삭제</button>
                          </div>
                          <input
                            value={item.question}
                            onChange={(e) => { const u = [...form.faq]; u[idx] = { ...u[idx], question: e.target.value }; update("faq", u); }}
                            placeholder="질문"
                            className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                          <textarea
                            value={item.answer}
                            onChange={(e) => { const u = [...form.faq]; u[idx] = { ...u[idx], answer: e.target.value }; update("faq", u); }}
                            placeholder="답변"
                            rows={2}
                            className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] resize-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => update("faq", [...form.faq, { question: "", answer: "" }])}
                        className="w-full rounded-lg border-2 border-dashed border-[#e2ddd6] py-3 text-[14px] text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors press-scale"
                      >
                        + Q&A 추가
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* 저장 버튼 */}
        <motion.div variants={fadeUp} className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-[50px] w-full items-center justify-center rounded-xl bg-[#2d6a4f] text-[15px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 disabled:cursor-not-allowed press-scale"
          >
            {isSaving ? "저장중..." : "저장"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── 공통 필드 컴포넌트 ──────────────────

function Field({
  label, value, onChange, multiline, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#1a1918] block mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3.5 py-2.5 text-[14px] text-[#1a1918] resize-none placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#e2ddd6] bg-white px-3.5 py-2.5 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}

function TagField({
  label, tags, onRemove, inputValue, onInputChange, onAdd,
}: {
  label: string; tags: string[]; onRemove: (i: number) => void;
  inputValue: string; onInputChange: (v: string) => void; onAdd: () => void;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#1a1918] block mb-1.5">{label}</label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onRemove(i)}
              className="rounded-full bg-[#d4ede4] px-3 py-1 text-[13px] text-[#2d6a4f] hover:bg-[#c0e4d8] transition-colors press-scale"
            >
              {tag} <span className="ml-1 text-[#4a8c6a]">x</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={`${label} 입력`}
          className="flex-1 rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors press-scale"
        >
          추가
        </button>
      </div>
    </div>
  );
}
