import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseCurrencyValue } from "@/lib/utils"

interface DataSummaryProps {
  title: string
  data: any[]
  type: "deals" | "contacts" | "clients"
}

export function DataSummary({ title, data, type }: DataSummaryProps) {
  // Calculate summary statistics based on data type
  const getSummaryStats = () => {
    const count = data.length

    if (type === "deals") {
      // Calculate total and average deal value
      const totalValue = data.reduce((sum, deal) => sum + parseCurrencyValue(deal.value), 0)
      const avgValue = totalValue / count

      // Count deals by stage
      const stageCount = data.reduce(
        (acc, deal) => {
          const stage = deal.stage
          acc[stage] = (acc[stage] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        count,
        totalValue: `$${totalValue.toLocaleString()}`,
        avgValue: `$${avgValue.toLocaleString()}`,
        stageBreakdown: Object.entries(stageCount).map(([stage, count]) => ({ stage, count })),
      }
    }

    if (type === "contacts") {
      // Count contacts by company
      const companyCount = data.reduce(
        (acc, contact) => {
          const company = contact.company
          acc[company] = (acc[company] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const uniqueCompanies = Object.keys(companyCount).length

      return {
        count,
        uniqueCompanies,
        companyBreakdown: Object.entries(companyCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([company, count]) => ({ company, count })),
      }
    }

    if (type === "clients") {
      // Calculate total and average revenue
      const totalRevenue = data.reduce((sum, client) => sum + parseCurrencyValue(client.revenue), 0)
      const avgRevenue = totalRevenue / count

      // Count clients by industry
      const industryCount = data.reduce(
        (acc, client) => {
          const industry = client.industry
          acc[industry] = (acc[industry] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const uniqueIndustries = Object.keys(industryCount).length

      return {
        count,
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        avgRevenue: `$${avgRevenue.toLocaleString()}`,
        uniqueIndustries,
        topIndustries: Object.entries(industryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([industry, count]) => ({ industry, count })),
      }
    }

    return { count }
  }

  const stats = getSummaryStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {type === "deals" && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{stats.totalValue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Value</p>
                <p className="text-2xl font-bold">{stats.avgValue}</p>
              </div>
              <div className="col-span-full space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Stage Breakdown</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.stageBreakdown.map(({ stage, count }) => (
                    <div key={stage} className="flex justify-between">
                      <span className="text-sm">{stage}:</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === "contacts" && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unique Companies</p>
                <p className="text-2xl font-bold">{stats.uniqueCompanies}</p>
              </div>
              <div className="col-span-full space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Top Companies</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.companyBreakdown.map(({ company, count }) => (
                    <div key={company} className="flex justify-between">
                      <span className="text-sm">{company}:</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === "clients" && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{stats.totalRevenue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Revenue</p>
                <p className="text-2xl font-bold">{stats.avgRevenue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unique Industries</p>
                <p className="text-2xl font-bold">{stats.uniqueIndustries}</p>
              </div>
              <div className="col-span-full space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Top Industries</p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.topIndustries.map(({ industry, count }) => (
                    <div key={industry} className="flex justify-between">
                      <span className="text-sm">{industry}:</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
