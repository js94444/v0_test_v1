import sql from 'mssql'
import type { Application, VisitR3Application, PortAccessApplication, ApplicationStatus, ApplicationType } from '@/lib/types'
import { ApplicationStatus as Status, ApplicationType as Type, AccessArea } from '@/lib/types'

const config: sql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config)
    console.log('[v0] Azure SQL connection pool created')
  }
  return pool
}

// 접수번호 생성 함수
function generateReceiptNumber(type: ApplicationType): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')

  const typeCode = {
    [Type.VISIT_R3]: 'VR',
    [Type.GROUP_VISIT]: 'GV',
    [Type.PORT_ACCESS]: 'PA',
    [Type.GOODS_INOUT]: 'GI',
  }[type]

  return `${typeCode}-${year}${month}${day}-${random}`
}

export class AzureSqlDB {
  // 개인방문 신청서 생성
  static async createVisitR3Application(
    data: Omit<VisitR3Application, 'id' | 'receipt' | 'created_at' | 'updated_at' | 'status' | 'type'>
  ): Promise<VisitR3Application> {
    const dbPool = await getPool()
    const receipt = generateReceiptNumber(Type.VISIT_R3)
    const now = new Date()
    const id = `${now.getTime()}-${Math.random().toString(36).substring(7)}`

    console.log('[v0] Creating VISIT_R3 application:', { id, receipt })

    const result = await dbPool
      .request()
      .input('id', sql.VarChar(50), id)
      .input('receipt', sql.VarChar(50), receipt)
      .input('type', sql.VarChar(20), 'VISIT_R3')
      .input('status', sql.VarChar(20), 'PENDING')
      .input('visitor_name', sql.NVarChar(100), data.visitor_name)
      .input('visitor_phone', sql.VarChar(20), data.visitor_phone)
      .input('visitor_organization', sql.NVarChar(200), data.visitor_organization)
      .input('visitor_position', sql.NVarChar(100), data.visitor_position)
      .input('visit_datetime', sql.DateTime, data.visit_datetime)
      .input('visit_purpose', sql.NVarChar(500), data.visit_purpose)
      .input('contact_name', sql.NVarChar(100), data.contact_name || null)
      .input('contact_email', sql.VarChar(200), data.contact_email || null)
      .input('access_area', sql.VarChar(50), data.access_area)
      .input('vehicle_number', sql.VarChar(20), data.vehicle_number || null)
      .input('vehicle_model', sql.NVarChar(50), data.vehicle_model || null)
      .input('visit_start_time', sql.VarChar(10), data.visit_start_time || null)
      .input('visit_end_time', sql.VarChar(10), data.visit_end_time || null)
      .input('created_at', sql.DateTime, now)
      .input('updated_at', sql.DateTime, now).query(`
        INSERT INTO visit_r3 (
          id, receipt, type, status,
          visitor_name, visitor_phone, visitor_organization, visitor_position,
          visit_datetime, visit_purpose, contact_name, contact_email,
          access_area, vehicle_number, vehicle_model,
          visit_start_time, visit_end_time,
          created_at, updated_at
        ) VALUES (
          @id, @receipt, @type, @status,
          @visitor_name, @visitor_phone, @visitor_organization, @visitor_position,
          @visit_datetime, @visit_purpose, @contact_name, @contact_email,
          @access_area, @vehicle_number, @vehicle_model,
          @visit_start_time, @visit_end_time,
          @created_at, @updated_at
        )
      `)

    console.log('[v0] VISIT_R3 application created in Azure SQL:', id)

    const application: VisitR3Application = {
      id,
      receipt,
      type: Type.VISIT_R3,
      status: Status.PENDING,
      visitor_name: data.visitor_name,
      visitor_phone: data.visitor_phone,
      visitor_organization: data.visitor_organization,
      visitor_position: data.visitor_position,
      visit_datetime: data.visit_datetime,
      visit_purpose: data.visit_purpose,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      access_area: data.access_area,
      vehicle_number: data.vehicle_number,
      vehicle_model: data.vehicle_model,
      visit_start_time: data.visit_start_time,
      visit_end_time: data.visit_end_time,
      created_at: now,
      updated_at: now,
      files: [],
    }

    return application
  }

  // 항만출입 신청서 생성
  static async createPortAccessApplication(
    data: Omit<PortAccessApplication, 'id' | 'receipt' | 'created_at' | 'updated_at' | 'status' | 'type' | 'files'>
  ): Promise<PortAccessApplication> {
    const dbPool = await getPool()
    const receipt = generateReceiptNumber(Type.PORT_ACCESS)
    const now = new Date()
    const id = `${now.getTime()}-${Math.random().toString(36).substring(7)}`

    console.log('[v0] Creating PORT_ACCESS application:', { id, receipt })

    // 항만출입 신청서 생성
    await dbPool
      .request()
      .input('id', sql.VarChar(50), id)
      .input('receipt', sql.VarChar(50), receipt)
      .input('type', sql.VarChar(20), 'PORT_ACCESS')
      .input('status', sql.VarChar(20), 'PENDING')
      .input('contact_name', sql.NVarChar(100), data.contact_name || null)
      .input('access_area', sql.VarChar(50), data.access_area)
      .input('access_start_datetime', sql.DateTime, data.access_start_datetime)
      .input('access_end_datetime', sql.DateTime, data.access_end_datetime)
      .input('access_purpose', sql.NVarChar(500), data.access_purpose)
      .input('vehicle_number', sql.VarChar(20), data.vehicle_number || null)
      .input('vehicle_model', sql.NVarChar(50), data.vehicle_model || null)
      .input('visit_start_time', sql.VarChar(10), data.visit_start_time || null)
      .input('visit_end_time', sql.VarChar(10), data.visit_end_time || null)
      .input('created_at', sql.DateTime, now)
      .input('updated_at', sql.DateTime, now).query(`
        INSERT INTO port_access (
          id, receipt, type, status,
          contact_name, access_area,
          access_start_datetime, access_end_datetime, access_purpose,
          vehicle_number, vehicle_model,
          visit_start_time, visit_end_time,
          created_at, updated_at
        ) VALUES (
          @id, @receipt, @type, @status,
          @contact_name, @access_area,
          @access_start_datetime, @access_end_datetime, @access_purpose,
          @vehicle_number, @vehicle_model,
          @visit_start_time, @visit_end_time,
          @created_at, @updated_at
        )
      `)

    // 인원 정보 저장
    if (data.personnel && data.personnel.length > 0) {
      for (const person of data.personnel) {
        await dbPool
          .request()
          .input('application_id', sql.VarChar(50), id)
          .input('organization', sql.NVarChar(200), person.organization)
          .input('position', sql.NVarChar(100), person.position)
          .input('name', sql.NVarChar(100), person.name)
          .input('birth_date', sql.VarChar(10), person.birth_date)
          .input('address', sql.NVarChar(300), person.address).query(`
            INSERT INTO port_access_personnel (
              application_id, organization, position, name, birth_date, address
            ) VALUES (
              @application_id, @organization, @position, @name, @birth_date, @address
            )
          `)
      }
    }

    console.log('[v0] PORT_ACCESS application created in Azure SQL:', id)

    const application: PortAccessApplication = {
      id,
      receipt,
      type: Type.PORT_ACCESS,
      status: Status.PENDING,
      contact_name: data.contact_name,
      access_area: data.access_area,
      access_start_datetime: data.access_start_datetime,
      access_end_datetime: data.access_end_datetime,
      access_purpose: data.access_purpose,
      personnel: data.personnel || [],
      vehicle_number: data.vehicle_number,
      vehicle_model: data.vehicle_model,
      visit_start_time: data.visit_start_time,
      visit_end_time: data.visit_end_time,
      created_at: now,
      updated_at: now,
      files: [],
    }

    return application
  }

  // 접수번호로 조회
  static async getApplicationByReceipt(receipt: string): Promise<Application | null> {
    const dbPool = await getPool()

    console.log('[v0] Getting application by receipt:', receipt)

    // Try visit_r3 first
    let result = await dbPool
      .request()
      .input('receipt', sql.VarChar(50), receipt)
      .query('SELECT * FROM visit_r3 WHERE receipt = @receipt')

    if (result.recordset.length > 0) {
      const row = result.recordset[0]
      const application: VisitR3Application = {
        id: row.id,
        receipt: row.receipt,
        type: Type.VISIT_R3,
        status: row.status as ApplicationStatus,
        visitor_name: row.visitor_name,
        visitor_phone: row.visitor_phone,
        visitor_organization: row.visitor_organization,
        visitor_position: row.visitor_position,
        visit_datetime: new Date(row.visit_datetime),
        visit_purpose: row.visit_purpose,
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        access_area: row.access_area as AccessArea,
        vehicle_number: row.vehicle_number,
        vehicle_model: row.vehicle_model,
        visit_start_time: row.visit_start_time,
        visit_end_time: row.visit_end_time,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        rejection_reason: row.rejection_reason,
        files: [],
      }

      return application
    }

    // Try port_access
    result = await dbPool
      .request()
      .input('receipt', sql.VarChar(50), receipt)
      .query('SELECT * FROM port_access WHERE receipt = @receipt')

    if (result.recordset.length > 0) {
      const row = result.recordset[0]
      
      // Get personnel
      const personnelResult = await dbPool
        .request()
        .input('application_id', sql.VarChar(50), row.id)
        .query('SELECT * FROM port_access_personnel WHERE application_id = @application_id')

      const personnel = personnelResult.recordset.map((p) => ({
        organization: p.organization,
        position: p.position,
        name: p.name,
        birth_date: p.birth_date,
        address: p.address,
      }))

      const application: PortAccessApplication = {
        id: row.id,
        receipt: row.receipt,
        type: Type.PORT_ACCESS,
        status: row.status as ApplicationStatus,
        contact_name: row.contact_name,
        access_area: row.access_area as AccessArea,
        access_start_datetime: new Date(row.access_start_datetime),
        access_end_datetime: new Date(row.access_end_datetime),
        access_purpose: row.access_purpose,
        personnel,
        vehicle_number: row.vehicle_number,
        vehicle_model: row.vehicle_model,
        visit_start_time: row.visit_start_time,
        visit_end_time: row.visit_end_time,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        rejection_reason: row.rejection_reason,
        files: [],
      }

      return application
    }

    return null
  }

  // ID로 조회
  static async getApplicationById(id: string): Promise<Application | null> {
    const dbPool = await getPool()

    console.log('[v0] Getting application by ID:', id)

    const result = await dbPool.request().input('id', sql.VarChar(50), id).query('SELECT * FROM visit_r3 WHERE id = @id')

    if (result.recordset.length === 0) {
      return null
    }

    const row = result.recordset[0]
    const application: VisitR3Application = {
      id: row.id,
      receipt: row.receipt,
      type: Type.VISIT_R3,
      status: row.status as ApplicationStatus,
      visitor_name: row.visitor_name,
      visitor_phone: row.visitor_phone,
      visitor_organization: row.visitor_organization,
      visitor_position: row.visitor_position,
      visit_datetime: new Date(row.visit_datetime),
      visit_purpose: row.visit_purpose,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      access_area: row.access_area as AccessArea,
      vehicle_number: row.vehicle_number,
      vehicle_model: row.vehicle_model,
      visit_start_time: row.visit_start_time,
      visit_end_time: row.visit_end_time,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      rejection_reason: row.rejection_reason,
      files: [],
    }

    return application
  }

  // 모든 신청서 조회
  static async getAllApplications(): Promise<Application[]> {
    const dbPool = await getPool()

    console.log('[v0] Getting all applications from Azure SQL')

    const result = await dbPool.request().query('SELECT * FROM visit_r3 ORDER BY created_at DESC')

    const applications: Application[] = result.recordset.map((row) => {
      const application: VisitR3Application = {
        id: row.id,
        receipt: row.receipt,
        type: Type.VISIT_R3,
        status: row.status as ApplicationStatus,
        visitor_name: row.visitor_name,
        visitor_phone: row.visitor_phone,
        visitor_organization: row.visitor_organization,
        visitor_position: row.visitor_position,
        visit_datetime: new Date(row.visit_datetime),
        visit_purpose: row.visit_purpose,
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        access_area: row.access_area as AccessArea,
        vehicle_number: row.vehicle_number,
        vehicle_model: row.vehicle_model,
        visit_start_time: row.visit_start_time,
        visit_end_time: row.visit_end_time,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        rejection_reason: row.rejection_reason,
        files: [],
      }
      return application
    })

    console.log('[v0] Retrieved applications from Azure SQL:', applications.length)

    return applications
  }

  // 상태 업데이트
  static async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    rejectionReason?: string
  ): Promise<Application | null> {
    const dbPool = await getPool()

    console.log('[v0] Updating application status:', { id, status, rejectionReason })

    await dbPool
      .request()
      .input('id', sql.VarChar(50), id)
      .input('status', sql.VarChar(20), status)
      .input('rejection_reason', sql.NVarChar(500), rejectionReason || null)
      .input('updated_at', sql.DateTime, new Date()).query(`
        UPDATE visit_r3
        SET status = @status,
            rejection_reason = @rejection_reason,
            updated_at = @updated_at
        WHERE id = @id
      `)

    return await this.getApplicationById(id)
  }

  // 통계 조회
  static async getApplicationStats() {
    const dbPool = await getPool()

    const totalResult = await dbPool.request().query('SELECT COUNT(*) as total FROM visit_r3')

    const statusResult = await dbPool.request().query(`
      SELECT status, COUNT(*) as count
      FROM visit_r3
      GROUP BY status
    `)

    const totalApplications = totalResult.recordset[0].total

    const statusStats = {
      PENDING: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
    }

    statusResult.recordset.forEach((row) => {
      statusStats[row.status as keyof typeof statusStats] = row.count
    })

    const typeStats = {
      GROUP_VISIT: 0,
      PORT_ACCESS: 0,
      GOODS_INOUT: 0,
      VISIT_R3: totalApplications,
    }

    // Monthly stats for the last 6 months
    const now = new Date()
    const monthlyStats = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthName = `${year}년 ${month}월`

      const monthResult = await dbPool
        .request()
        .input('year', sql.Int, year)
        .input('month', sql.Int, month).query(`
        SELECT COUNT(*) as total
        FROM visit_r3
        WHERE YEAR(created_at) = @year AND MONTH(created_at) = @month
      `)

      monthlyStats.push({
        month: monthName,
        GROUP_VISIT: 0,
        PORT_ACCESS: 0,
        GOODS_INOUT: 0,
        VISIT_R3: monthResult.recordset[0].total,
        total: monthResult.recordset[0].total,
      })
    }

    return {
      totalApplications,
      statusStats,
      typeStats,
      monthlyStats,
    }
  }
}
