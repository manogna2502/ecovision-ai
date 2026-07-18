import React from "react";
import { motion } from "framer-motion";
import { Trash2, Layers, DollarSign, AlertOctagon, Recycle, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

const PROBLEMS = [
  { icon: Trash2, title: "Overflowing bins", desc: "Bins routinely overflow before scheduled pickup, drawing complaints and pests.", span: "lg:col-span-2" },
  { icon: Layers, title: "Poor segregation", desc: "Mixed waste streams reduce recycling yield and raise processing costs.", span: "" },
  { icon: DollarSign, title: "High collection costs", desc: "Fixed routes ignore real fill levels, wasting fuel and crew hours.", span: "" },
  { icon: AlertOctagon, title: "Illegal dumping", desc: "Unmonitored sites accumulate waste with no early detection.", span: "lg:col-span-2" },
  { icon: Recycle, title: "Low recycling rates", desc: "Without accurate classification, recoverable material ends up in landfill.", span: "" },
  { icon: Truck, title: "Route inefficiency", desc: "Static schedules mean trucks visit bins that don't need collection yet.", span: "" },
];

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">The problem, at scale</h2>
        <p className="mt-3 text-muted-foreground">
          These issues compound across a city — each one small, together they define
          the cost and health impact of urban waste systems.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((p, i) => (
          <motion.div
            key={p.title}
            className={p.span}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
          >
            <Card className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <p.icon size={19} />
              </div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
