"use client";

import { useState } from "react";
import { Users, BedDouble, Check, Loader2, Heart, Lock } from "lucide-react";
import { type Room } from "@/lib/crm/lodging";
import { formatCurrency } from "@/lib/utils";

export function GuestRoomBooking({ rooms: initial }: { rooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [paying, setPaying] = useState(false);

  const claimed = rooms.filter((r) => r.paid).length;

  async function pay(id: string) {
    if (!name.trim()) return;
    setPaying(true);
    // Pluggable: swap for a Stripe Checkout redirect when STRIPE_SECRET_KEY is set.
    await new Promise((r) => setTimeout(r, 900));
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, coveredBy: "guest", guestName: name, paid: true } : r)));
    setPaying(false);
    setOpenId(null);
    setName("");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-xl bg-white/5 px-5 py-3 text-sm ring-1 ring-white/10">
        <span className="text-parchment/70">{claimed} of {rooms.length} rooms reserved</span>
        <span className="flex items-center gap-1.5 text-parchment/70"><Lock size={13} /> Secure payment</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((r) => {
          const booked = r.paid;
          const open = openId === r.id;
          return (
            <div key={r.id} className={`rounded-2xl p-5 ring-1 transition ${booked ? "bg-white/5 ring-white/10" : "bg-white/10 ring-white/20"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-display text-2xl text-parchment"><BedDouble size={18} className="text-brass-soft" /> {r.name}</p>
                  <p className="mt-1 text-sm text-parchment/60">{r.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-parchment/50"><Users size={11} /> Sleeps {r.sleeps}</p>
                </div>
                <span className="shrink-0 font-display text-2xl text-brass-soft">{formatCurrency(r.price)}</span>
              </div>

              {booked ? (
                <p className="mt-4 flex items-center gap-2 rounded-full bg-sage/15 px-4 py-2 text-sm text-parchment/80">
                  <Check size={15} className="text-sage" /> Reserved{r.guestName ? ` by ${r.guestName}` : ""}
                </p>
              ) : open ? (
                <div className="mt-4 space-y-2">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-parchment outline-none placeholder:text-parchment/40 focus:border-brass"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => pay(r.id)} disabled={paying || !name.trim()} className="btn bg-parchment text-ink flex-1 !py-2.5 !text-xs disabled:opacity-50">
                      {paying ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Pay {formatCurrency(r.price)}
                    </button>
                    <button onClick={() => setOpenId(null)} className="btn btn-light !py-2.5 !px-4 !text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setOpenId(r.id); setName(""); }} className="btn bg-parchment text-ink mt-4 w-full !py-2.5 !text-xs">
                  <Heart size={14} /> Reserve This Room
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-sm text-parchment/60">
        Reserving a room covers your own stay — and takes it right off the couple's total. What a gift. 💛
      </p>
    </div>
  );
}
