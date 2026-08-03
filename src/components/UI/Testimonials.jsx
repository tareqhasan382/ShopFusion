import Image from "next/image";
import { Star, Quote } from "lucide-react";

const TestimonialData = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Verified buyer",
    text: "The quality exceeded my expectations. Shipping was fast and the customer support team was incredibly helpful.",
    img: "https://picsum.photos/101/101",
  },
  {
    id: 2,
    name: "David Chen",
    role: "Verified buyer",
    text: "I've ordered multiple times and every product has been exactly as described. ShopFusion is now my go-to store.",
    img: "https://picsum.photos/102/102",
  },
  {
    id: 3,
    name: "Amina Rahman",
    role: "Verified buyer",
    text: "Great selection and seamless checkout experience. Highly recommend to anyone looking for quality products.",
    img: "https://picsum.photos/104/104",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            What our customers say
          </p>
          <h2 className="section-title mt-2">Testimonials</h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TestimonialData.map((data) => (
            <figure
              key={data.id}
              className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-indigo-200" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-slate-600">
                {data.text}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <Image
                  src={data.img}
                  alt={data.name}
                  height={100}
                  width={100}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {data.name}
                  </p>
                  <p className="text-xs text-slate-500">{data.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
