import { VehicleFinder } from "@/components/vehicleFinder"
import { VehicleFinderSm } from "@/components/vehicleFinderSm"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div>
        <VehicleFinder />
      </div>
    </section>
  )
}
