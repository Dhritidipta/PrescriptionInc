package com.prescription.app.server;

import java.util.UUID;
public class Version {
    private int id;
    private String version;
    private String modifiedDate;
    private String notes;
    private int printedCopies;
    private String filename;

    public Version() {}

    public Version(String version, String modifiedDate, String notes, int printedCopies, String filename) {
        this.id = UUID.randomUUID().hashCode();
        this.version = version;
        this.modifiedDate = modifiedDate;
        this.notes = notes;
        this.printedCopies = printedCopies;
        this.filename = filename;
    }

    public int getId() { return this.id; }
    // public void setId(int id) { this.id = id; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(String modifiedDate) { this.modifiedDate = modifiedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public int getPrintedCopies() { return printedCopies; }
    public void setPrintedCopies(int printedCopies) { this.printedCopies = printedCopies; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
}
